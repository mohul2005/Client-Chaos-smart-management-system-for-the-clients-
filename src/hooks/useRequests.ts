import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { notifyAssignment } from '@/lib/notifications';
import type { Client, Priority, Profile, RequestItem, RequestStatus, RequestView, TaskStatus } from '@/lib/types';

/** Fields collected when a request is promoted into tracked work. */
export interface AssignPayload {
  client_id: string | null;
  assignee_id: string | null;
  priority: Priority;
  due_date: string | null;
}

/** Optional extras that can accompany any stage move. */
export interface StagePatch {
  assignee_id?: string | null;
  due_date?: string | null;
  clarification_note?: string | null;
}

/** Fields a client submits from the public intake form. */
export interface PublicRequestInput {
  client_name: string;
  contact_email: string;
  title: string;
  details: string;
  priority: Priority;
}

/** Forward map: a request stage gesture -> the board task status it should drive. */
function taskStatusForStage(status: RequestStatus): TaskStatus | null {
  if (status === 'waiting_on_client') return 'waiting_on_client';
  if (status === 'done') return 'done';
  if (status === 'in_progress') return 'in_progress';
  return null;
}

/**
 * Request inbox data + the client-request lifecycle.
 * Requests run their own pipeline (owner + due date included) and only become a
 * board task once they reach "In Progress".
 */
export function useRequests() {
  const [requests, setRequests] = useState<RequestView[]>([]);
  const requestsRef = useRef<RequestView[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [reqRes, clientRes, memberRes] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('name', { ascending: true }),
        supabase.from('profiles').select('*').order('full_name', { ascending: true }),
      ]);
      if (reqRes.error) throw reqRes.error;
      if (clientRes.error) throw clientRes.error;
      if (memberRes.error) throw memberRes.error;

      const clientList = (clientRes.data || []) as Client[];
      const memberList = (memberRes.data || []) as Profile[];
      const clientMap = new Map(clientList.map((c) => [c.id, c.name]));
      const memberMap = new Map(memberList.map((m) => [m.id, m]));

      const enriched: RequestView[] = ((reqRes.data || []) as RequestItem[]).map((r) => {
        const m = r.assignee_id ? memberMap.get(r.assignee_id) : undefined;
        return {
          ...r,
          clientName: r.client_id ? clientMap.get(r.client_id) ?? null : null,
          assigneeName: m?.full_name ?? null,
          assigneeColor: m?.avatar_color ?? null,
        };
      });

      requestsRef.current = enriched;
      setRequests(enriched);
      setClients(clientList);
      setMembers(memberList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the request inbox.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Move a request to any stage, optionally patching owner / due date / note. */
  const moveStage = useCallback(
    async (request: RequestView, status: RequestStatus, patch: StagePatch = {}) => {
      const update: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
        ...patch,
      };
      // Stamp (or clear) the moment the request entered "waiting on client" so
      // managers can see how long it has gone quiet.
      update.waiting_since = status === 'waiting_on_client' ? new Date().toISOString() : null;
      const { error: err } = await supabase.from('requests').update(update).eq('id', request.id);
      if (err) throw err;

      // Keep the linked board task in step so a paused request never looks overdue.
      const taskStatus = taskStatusForStage(status);
      if (taskStatus && request.task_id) {
        await supabase.from('tasks').update({ status: taskStatus }).eq('id', request.task_id);
      }
      await load();
    },
    [load],
  );

  const deleteRequest = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('requests').delete().eq('id', id);
      if (err) throw err;
      await load();
    },
    [load],
  );

  /** Promote a request into tracked work: spawn the board task and go In Progress. */
  const assignAndStart = useCallback(
    async (request: RequestView, payload: AssignPayload) => {
      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData.user?.id ?? null;

      const { data: taskData, error: taskErr } = await supabase
        .from('tasks')
        .insert({
          title: request.title,
          description: request.details,
          client_id: payload.client_id,
          assignee_id: payload.assignee_id,
          status: 'in_progress',
          priority: payload.priority,
          due_date: payload.due_date,
          source: 'request',
          request_id: request.id,
          created_by: actorId,
        })
        .select('id')
        .maybeSingle();
      if (taskErr) throw taskErr;

      const newId = (taskData as { id: string } | null)?.id ?? null;
      if (newId) {
        await supabase.from('task_activity').insert({ task_id: newId, actor_id: actorId, kind: 'converted' });
        // Email the owner that this request is now on their plate.
        if (payload.assignee_id) notifyAssignment(newId);
      }

      const { error: reqErr } = await supabase
        .from('requests')
        .update({
          status: 'in_progress',
          assignee_id: payload.assignee_id,
          client_id: payload.client_id,
          priority: payload.priority,
          due_date: payload.due_date,
          task_id: newId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', request.id);
      if (reqErr) throw reqErr;

      await load();
    },
    [load],
  );

  const seedSampleRequests = useCallback(async () => {
    const iso = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    const isoDaysAgo = (offset: number) => {
      const d = new Date();
      d.setDate(d.getDate() - offset);
      return d.toISOString();
    };

    const sample: (PublicRequestInput & {
      status: RequestStatus;
      due_date: string | null;
      waiting_since?: string | null;
    })[] = [
      {
        client_name: 'Northwind Retail',
        contact_email: 'maya.chen@northwind.com',
        title: 'Add a holiday promo banner to the homepage',
        details:
          'We are launching a Black Friday promo and need a banner with a countdown at the top of the homepage. Copy and artwork will be shared, we just need it built and scheduled to go live on the 24th.',
        priority: 'high',
        status: 'new',
        due_date: null,
      },
      {
        client_name: 'Bluepeak Commerce',
        contact_email: 'dev@bluepeak.io',
        title: 'Checkout is failing for customers in Canada',
        details:
          'Several customers reported the checkout button does nothing when a Canadian address is selected. This is blocking sales — please look urgently.',
        priority: 'urgent',
        status: 'ready_to_assign',
        due_date: iso(2),
      },
      {
        client_name: 'Crestline Health',
        contact_email: 'ops@crestlinehealth.org',
        title: 'Set up a support form on the contact page',
        details:
          'We would like a form so patients can reach the right department. It should route to our shared inbox and send an auto-reply.',
        priority: 'medium',
        status: 'needs_clarification',
        due_date: null,
      },
      {
        client_name: 'Meridian Group',
        contact_email: 'sara.lindqvist@meridian.co',
        title: 'Can you export last quarter analytics to a PDF?',
        details:
          'We need a branded PDF report of the Q2 dashboard to share with our board. Same layout as last time would be perfect.',
        priority: 'medium',
        status: 'waiting_on_client',
        due_date: iso(-3),
        waiting_since: isoDaysAgo(9),
      },
      {
        client_name: 'Solstice Media',
        contact_email: 'hello@solsticemedia.com',
        title: 'Update the team page with three new hires',
        details:
          'Please add our three new editors with photos and short bios. I have attached the details in a separate email.',
        priority: 'low',
        status: 'needs_clarification',
        due_date: null,
      },
      {
        client_name: 'Northwind Retail',
        contact_email: 'maya.chen@northwind.com',
        title: 'Our blog images look stretched on mobile',
        details: 'On phones the article images are squashed. They look fine on desktop. Could you take a look?',
        priority: 'low',
        status: 'new',
        due_date: null,
      },
    ];

    const { error: err } = await supabase.from('requests').insert(sample);
    if (err) throw err;
    await load();
  }, [load]);

  return {
    requests,
    clients,
    members,
    loading,
    error,
    reload: load,
    moveStage,
    assignAndStart,
    deleteRequest,
    seedSampleRequests,
  };
}
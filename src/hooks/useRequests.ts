import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { notifyAssignment } from '@/lib/notifications';
import type { Client, Priority, Profile, RequestItem } from '@/lib/types';

export interface ConvertPayload {
  client_id: string | null;
  assignee_id: string | null;
  priority: Priority;
  due_date: string | null;
}

/** Fields a client submits from the public intake form. */
export interface PublicRequestInput {
  client_name: string;
  contact_email: string;
  title: string;
  details: string;
  priority: Priority;
}

/**
 * Request inbox data: incoming client requests plus the clients + team
 * needed to triage and convert a request into a tracked task.
 */
export function useRequests() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
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

      setRequests((reqRes.data || []) as RequestItem[]);
      setClients((clientRes.data || []) as Client[]);
      setMembers((memberRes.data || []) as Profile[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the request inbox.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = useCallback(
    async (id: string, status: RequestItem['status']) => {
      const { error: err } = await supabase.from('requests').update({ status }).eq('id', id);
      if (err) throw err;
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

  /** Turn a request into a tracked task and mark the request converted. */
  const convertToTask = useCallback(
    async (request: RequestItem, payload: ConvertPayload) => {
      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData.user?.id ?? null;
      const { data: taskData, error: taskErr } = await supabase
        .from('tasks')
        .insert({
          title: request.title,
          description: request.details,
          client_id: payload.client_id,
          assignee_id: payload.assignee_id,
          status: 'todo',
          priority: payload.priority,
          due_date: payload.due_date,
          source: 'request',
          created_by: actorId,
        })
        .select('id')
        .maybeSingle();
      if (taskErr) throw taskErr;

      const newId = (taskData as { id: string } | null)?.id;
      if (newId) {
        await supabase
          .from('task_activity')
          .insert({ task_id: newId, actor_id: actorId, kind: 'converted' });
        // Email the owner that this request is now on their plate.
        if (payload.assignee_id) notifyAssignment(newId);
      }

      const { error: reqErr } = await supabase
        .from('requests')
        .update({ status: 'converted' })
        .eq('id', request.id);
      if (reqErr) throw reqErr;

      await load();
    },
    [load],
  );

  const seedSampleRequests = useCallback(async () => {
    const sample: PublicRequestInput[] = [
      {
        client_name: 'Northwind Retail',
        contact_email: 'maya.chen@northwind.com',
        title: 'Add a holiday promo banner to the homepage',
        details:
          'We are launching a Black Friday promo and need a banner with a countdown at the top of the homepage. Copy and artwork will be shared, we just need it built and scheduled to go live on the 24th.',
        priority: 'high',
      },
      {
        client_name: 'Bluepeak Commerce',
        contact_email: 'dev@bluepeak.io',
        title: 'Checkout is failing for customers in Canada',
        details:
          'Several customers reported the checkout button does nothing when a Canadian address is selected. This is blocking sales — please look urgently.',
        priority: 'urgent',
      },
      {
        client_name: 'Meridian Group',
        contact_email: 'sara.lindqvist@meridian.co',
        title: 'Can you export last quarter analytics to a PDF?',
        details:
          'We need a branded PDF report of the Q2 dashboard to share with our board. Same layout as last time would be perfect.',
        priority: 'medium',
      },
      {
        client_name: 'Solstice Media',
        contact_email: 'hello@solsticemedia.com',
        title: 'Update the team page with three new hires',
        details:
          'Please add our three new editors with photos and short bios. I have attached the details in a separate email.',
        priority: 'low',
      },
      {
        client_name: 'Crestline Health',
        contact_email: 'ops@crestlinehealth.org',
        title: 'Set up a support form on the contact page',
        details:
          'We would like a form so patients can reach the right department. It should route to our shared inbox and send an auto-reply.',
        priority: 'medium',
      },
      {
        client_name: 'Northwind Retail',
        contact_email: 'maya.chen@northwind.com',
        title: 'Our blog images look stretched on mobile',
        details: 'On phones the article images are squashed. They look fine on desktop. Could you take a look?',
        priority: 'low',
      },
    ];

    const rows = sample.map((s) => ({ ...s, status: 'new' as const }));
    const { error: err } = await supabase.from('requests').insert(rows);
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
    setStatus,
    deleteRequest,
    convertToTask,
    seedSampleRequests,
  };
}
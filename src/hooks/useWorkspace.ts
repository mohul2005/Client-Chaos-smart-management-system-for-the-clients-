import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { notifyAssignment } from '@/lib/notifications';
import type { Client, Priority, Profile, Task, TaskStatus, TaskView } from '@/lib/types';

export interface TaskInput {
  title: string;
  description: string;
  client_id: string | null;
  assignee_id: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
}

type ClientInput = Omit<Client, 'id' | 'created_at'>;

/** A single row inserted into the task activity log. */
interface ActivityInsert {
  task_id: string;
  actor_id: string | null;
  kind: string;
  field?: string | null;
  old_value?: string | null;
  new_value?: string | null;
}

/** Compare the attempted patch against the current task and describe each change. */
function diffTask(
  current: TaskView,
  patch: Partial<TaskInput>,
): Omit<ActivityInsert, 'task_id' | 'actor_id'>[] {
  const events: Omit<ActivityInsert, 'task_id' | 'actor_id'>[] = [];
  const push = (field: string, kind: string, before: unknown, after: unknown) => {
    const b = before == null || before === '' ? null : String(before);
    const a = after == null || after === '' ? null : String(after);
    if (b === a) return;
    events.push({ field, kind, old_value: b, new_value: a });
  };
  if (patch.title !== undefined) push('title', 'title', current.title, patch.title);
  if (patch.description !== undefined) push('description', 'description', current.description, patch.description);
  if (patch.status !== undefined) push('status', 'status', current.status, patch.status);
  if (patch.priority !== undefined) push('priority', 'priority', current.priority, patch.priority);
  if (patch.assignee_id !== undefined) push('assignee_id', 'assignee', current.assignee_id, patch.assignee_id);
  if (patch.client_id !== undefined) push('client_id', 'client', current.client_id, patch.client_id);
  if (patch.due_date !== undefined) push('due_date', 'due_date', current.due_date, patch.due_date);
  return events;
}

/**
 * Shared workspace data: tasks (enriched with client + assignee),
 * the client directory and the team directory.
 */
export function useWorkspace() {
  const [tasks, setTasks] = useState<TaskView[]>([]);
  const tasksRef = useRef<TaskView[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [tasksRes, clientsRes, membersRes, commentsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('clients').select('*').order('name', { ascending: true }),
        supabase.from('profiles').select('*').order('full_name', { ascending: true }),
        supabase.from('task_comments').select('id, task_id'),
      ]);
      if (tasksRes.error) throw tasksRes.error;
      if (clientsRes.error) throw clientsRes.error;
      if (membersRes.error) throw membersRes.error;
      if (commentsRes.error) throw commentsRes.error;

      const clientList = (clientsRes.data || []) as Client[];
      const memberList = (membersRes.data || []) as Profile[];
      const clientMap = new Map(clientList.map((c) => [c.id, c.name]));
      const memberMap = new Map(memberList.map((m) => [m.id, m]));

      const commentCounts = new Map<string, number>();
      ((commentsRes.data || []) as { task_id: string | null }[]).forEach((c) => {
        if (c.task_id) commentCounts.set(c.task_id, (commentCounts.get(c.task_id) || 0) + 1);
      });

      const enriched: TaskView[] = ((tasksRes.data || []) as Task[]).map((t) => {
        const m = t.assignee_id ? memberMap.get(t.assignee_id) : undefined;
        return {
          ...t,
          clientName: t.client_id ? clientMap.get(t.client_id) ?? null : null,
          assigneeName: m?.full_name ?? null,
          assigneeColor: m?.avatar_color ?? null,
          commentCount: commentCounts.get(t.id) || 0,
        };
      });

      tasksRef.current = enriched;
      setTasks(enriched);
      setClients(clientList);
      setMembers(memberList);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your workspace.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const logActivity = useCallback(async (rows: ActivityInsert[]) => {
    if (!rows.length) return;
    // Activity is a background trail — never let it break the main action.
    await supabase.from('task_activity').insert(rows);
  }, []);

  const createTask = useCallback(
    async (input: TaskInput) => {
      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData.user?.id ?? null;
      const { data, error: err } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          description: input.description || null,
          client_id: input.client_id,
          assignee_id: input.assignee_id,
          status: input.status,
          priority: input.priority,
          due_date: input.due_date,
          source: 'internal',
          created_by: actorId,
        })
        .select('id')
        .maybeSingle();
      if (err) throw err;
      const newId = (data as { id: string } | null)?.id;
      if (newId) {
        await logActivity([{ task_id: newId, actor_id: actorId, kind: 'created' }]);
        // Let the owner know straight away (runs in the background).
        if (input.assignee_id) notifyAssignment(newId);
      }
      await load();
    },
    [load, logActivity],
  );

  const updateTask = useCallback(
    async (id: string, patch: Partial<TaskInput>) => {
      const current = tasksRef.current.find((t) => t.id === id);
      const { data: userData } = await supabase.auth.getUser();
      const actorId = userData.user?.id ?? null;
      const { error: err } = await supabase.from('tasks').update(patch).eq('id', id);
      if (err) throw err;
      if (current) {
        const events = diffTask(current, patch);
        await logActivity(events.map((e) => ({ ...e, task_id: id, actor_id: actorId })));
      }
      // Notify only when the task is freshly assigned to a different teammate.
      if (patch.assignee_id && patch.assignee_id !== current?.assignee_id) {
        notifyAssignment(id);
      }
      await load();
    },
    [load, logActivity],
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('tasks').delete().eq('id', id);
      if (err) throw err;
      await load();
    },
    [load],
  );

  const createClient = useCallback(
    async (input: ClientInput) => {
      const { error: err } = await supabase.from('clients').insert(input);
      if (err) throw err;
      await load();
    },
    [load],
  );

  const updateClient = useCallback(
    async (id: string, patch: ClientInput) => {
      const { error: err } = await supabase.from('clients').update(patch).eq('id', id);
      if (err) throw err;
      await load();
    },
    [load],
  );

  const deleteClient = useCallback(
    async (id: string) => {
      const { error: err } = await supabase.from('clients').delete().eq('id', id);
      if (err) throw err;
      await load();
    },
    [load],
  );

  const seedSampleTasks = useCallback(async () => {
    const today = new Date();
    const iso = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    };
    const cId = (name: string) => clients.find((c) => c.name === name)?.id ?? null;
    const mId = (i: number) => members[i]?.id ?? null;

    const sample = [
      { title: 'Draft Q4 campaign brief for Northwind Retail', client_id: cId('Northwind Retail'), assignee_id: mId(0), status: 'in_progress', priority: 'high', due_date: iso(2), description: 'Pull performance data from last quarter and outline the three campaign angles.' },
      { title: 'Fix checkout bug reported by Bluepeak', client_id: cId('Bluepeak Commerce'), assignee_id: mId(1), status: 'todo', priority: 'urgent', due_date: iso(-1), description: 'Cart totals mismatch on the mobile flow. Client blocked on launch.' },
      { title: 'Monthly analytics report — Meridian Group', client_id: cId('Meridian Group'), assignee_id: mId(0), status: 'review', priority: 'medium', due_date: iso(1), description: 'Compile the dashboard summary and send for internal review.' },
      { title: 'Onboard Crestline Health to the portal', client_id: cId('Crestline Health'), assignee_id: mId(2), status: 'todo', priority: 'high', due_date: iso(4), description: 'Set up accounts, import their team list and schedule the kickoff call.' },
      { title: 'Renew hosting contract for Solstice Media', client_id: cId('Solstice Media'), assignee_id: mId(1), status: 'todo', priority: 'medium', due_date: iso(9), description: 'Confirm renewal terms and update the billing contact.' },
      { title: 'Content calendar for Northwind summer push', client_id: cId('Northwind Retail'), assignee_id: mId(2), status: 'in_progress', priority: 'medium', due_date: iso(6), description: 'Twelve posts scheduled with copy and visuals.' },
      { title: 'SEO audit follow-ups — Meridian Group', client_id: cId('Meridian Group'), assignee_id: mId(0), status: 'done', priority: 'low', due_date: iso(-5), description: 'Implemented the top ten recommendations.' },
      { title: 'Redesign landing page hero — Bluepeak', client_id: cId('Bluepeak Commerce'), assignee_id: mId(1), status: 'review', priority: 'high', due_date: iso(0), description: 'Final hero variations ready for client sign-off.' },
      { title: 'Quarterly business review deck', client_id: null, assignee_id: mId(2), status: 'todo', priority: 'medium', due_date: iso(7), description: 'Internal QBR deck covering delivery, revenue and pipeline.' },
      { title: 'Migrate Solstice Media assets to new CDN', client_id: cId('Solstice Media'), assignee_id: mId(0), status: 'done', priority: 'medium', due_date: iso(-3), description: 'All assets migrated and verified.' },
      { title: 'Support retainer hours reconciliation', client_id: cId('Crestline Health'), assignee_id: mId(1), status: 'in_progress', priority: 'low', due_date: iso(5), description: 'Reconcile hours used against the monthly retainer.' },
      { title: 'Prepare proposal for Halcyon Ventures', client_id: null, assignee_id: mId(0), status: 'todo', priority: 'high', due_date: iso(3), description: 'Scope, timeline and pricing for the new engagement.' },
    ];

    const rows = sample.map((s) => ({ ...s, source: 'internal' }));
    const { error: err } = await supabase.from('tasks').insert(rows);
    if (err) throw err;
    await load();
  }, [clients, members, load]);

  return {
    tasks,
    clients,
    members,
    loading,
    error,
    reload: load,
    createTask,
    updateTask,
    deleteTask,
    createClient,
    updateClient,
    deleteClient,
    seedSampleTasks,
  };
}
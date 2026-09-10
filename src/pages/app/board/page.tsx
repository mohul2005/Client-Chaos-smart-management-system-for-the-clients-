import { useMemo, useState } from 'react';
import { useWorkspace, type TaskInput } from '@/hooks/useWorkspace';
import type { Priority, TaskStatus, TaskView } from '@/lib/types';
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from '@/lib/constants';
import { dueMeta } from '@/lib/format';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

export default function BoardPage() {
  const {
    tasks,
    clients,
    members,
    loading,
    error,
    reload,
    createTask,
    updateTask,
    deleteTask,
    seedSampleTasks,
  } = useWorkspace();

  const [query, setQuery] = useState('');
  const [assignee, setAssignee] = useState('all');
  const [priority, setPriority] = useState<'all' | Priority>('all');
  const [client, setClient] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TaskView | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');

  const [dragId, setDragId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<TaskStatus | null>(null);
  const [seeding, setSeeding] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !`${t.title} ${t.description ?? ''} ${t.clientName ?? ''}`.toLowerCase().includes(q)) return false;
      if (assignee === 'unassigned' && t.assignee_id) return false;
      if (assignee !== 'all' && assignee !== 'unassigned' && t.assignee_id !== assignee) return false;
      if (priority !== 'all' && t.priority !== priority) return false;
      if (client !== 'all' && t.client_id !== client) return false;
      return true;
    });
  }, [tasks, query, assignee, priority, client]);

  const grouped = useMemo(() => {
    const map: Record<TaskStatus, TaskView[]> = { todo: [], in_progress: [], review: [], done: [] };
    filtered.forEach((t) => map[t.status]?.push(t));
    Object.values(map).forEach((list) =>
      list.sort((a, b) => PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank),
    );
    return map;
  }, [filtered]);

  const stats = useMemo(() => {
    const open = tasks.filter((t) => t.status !== 'done');
    const overdue = open.filter((t) => {
      const d = dueMeta(t.due_date);
      return d.tone === 'danger';
    });
    const unassigned = open.filter((t) => !t.assignee_id);
    return [
      { label: 'Open tasks', value: open.length, icon: 'ri-list-check-2', tone: 'text-slate-700' },
      { label: 'Overdue', value: overdue.length, icon: 'ri-alarm-warning-line', tone: 'text-red-600' },
      { label: 'Unassigned', value: unassigned.length, icon: 'ri-user-unfollow-line', tone: 'text-amber-600' },
      { label: 'Completed', value: tasks.length - open.length, icon: 'ri-checkbox-circle-line', tone: 'text-emerald-600' },
    ];
  }, [tasks]);

  const openNew = (status: TaskStatus) => {
    setEditing(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const openTask = (task: TaskView) => {
    setEditing(task);
    setModalOpen(true);
  };

  const moveTask = async (task: TaskView, direction: -1 | 1) => {
    const idx = STATUS_ORDER.indexOf(task.status);
    const next = STATUS_ORDER[idx + direction];
    if (!next) return;
    await updateTask(task.id, { status: next });
  };

  const handleDrop = async (status: TaskStatus) => {
    setOverStatus(null);
    if (!dragId) return;
    const task = tasks.find((t) => t.id === dragId);
    setDragId(null);
    if (!task || task.status === status) return;
    await updateTask(task.id, { status });
  };

  const handleCreate = (input: TaskInput) => createTask(input);
  const handleUpdate = (id: string, patch: Partial<TaskInput>) => updateTask(id, patch);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedSampleTasks();
    } catch {
      // surfaced through the shared error state on reload
    } finally {
      setSeeding(false);
    }
  };

  const activeFilters = query || assignee !== 'all' || priority !== 'all' || client !== 'all';

  return (
    <div className="w-full">
      {/* Stats */}
      <div className="stats-grid grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{s.label}</span>
              <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center">
                <i className={`${s.icon} text-base ${s.tone}`}></i>
              </div>
            </div>
            <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-4 mb-5 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <i className="ri-search-line text-slate-400 text-base"></i>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, clients…"
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none cursor-pointer bg-white text-slate-600"
          >
            <option value="all">All owners</option>
            <option value="unassigned">Unassigned</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name || m.email}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'all' | Priority)}
            className="px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none cursor-pointer bg-white text-slate-600"
          >
            <option value="all">All priorities</option>
            {PRIORITY_ORDER.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_META[p].label}
              </option>
            ))}
          </select>

          <select
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none cursor-pointer bg-white text-slate-600"
          >
            <option value="all">All clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => openNew('todo')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-base"></i> New task
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <i className="ri-error-warning-line text-red-500"></i>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !error ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="flex flex-col gap-3">
              <div className="h-6 w-24 rounded bg-slate-200 animate-pulse" />
              {[0, 1].map((i) => (
                <div key={i} className="h-28 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {STATUS_ORDER.map((status) => {
            const list = grouped[status];
            const meta = STATUS_META[status];
            return (
              <section
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOverStatus(status);
                }}
                onDragLeave={() => setOverStatus((cur) => (cur === status ? null : cur))}
                onDrop={() => void handleDrop(status)}
                className={`rounded-xl border flex flex-col max-h-[calc(100vh-320px)] transition-colors ${
                  overStatus === status ? 'border-[#1c2b3a] bg-white' : 'border-slate-200 bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between px-3.5 py-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${meta.dot}`}></span>
                    <h3 className="text-sm font-bold text-slate-700">{meta.label}</h3>
                    <span className="text-xs font-medium text-slate-400">{list.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => openNew(status)}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    aria-label={`Add task to ${meta.label}`}
                  >
                    <i className="ri-add-line text-base"></i>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-2.5">
                  {list.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => openNew(status)}
                      className="w-full py-6 rounded-lg border border-dashed border-slate-300 text-xs text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-colors cursor-pointer"
                    >
                      <i className="ri-add-line mr-1"></i> Add a task
                    </button>
                  ) : (
                    list.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onOpen={openTask}
                        onDragStart={setDragId}
                        onDragEnd={() => setDragId(null)}
                        onMove={moveTask}
                        dragging={dragId === task.id}
                      />
                    ))
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Empty workspace */}
      {!loading && !error && tasks.length === 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-layout-column-line text-2xl text-slate-400"></i>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Your board is empty</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Create your first task, or drop in a realistic sample set so you can see the full workflow in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleSeed()}
              disabled={seeding || clients.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              {seeding ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-magic-line"></i>}
              Load sample tasks
            </button>
            <button
              type="button"
              onClick={() => openNew('todo')}
              className="px-5 py-2.5 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Create a task
            </button>
          </div>
        </div>
      )}

      {/* No results for filters */}
      {!loading && !error && tasks.length > 0 && filtered.length === 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">No tasks match your filters.</p>
          {activeFilters && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setAssignee('all');
                setPriority('all');
                setClient('all');
              }}
              className="mt-3 text-sm font-semibold text-[#1c2b3a] cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      <TaskModal
        open={modalOpen}
        task={editing}
        defaultStatus={defaultStatus}
        clients={clients}
        members={members}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onDelete={deleteTask}
      />
    </div>
  );
}
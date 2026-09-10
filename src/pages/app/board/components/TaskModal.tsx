import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Client, Priority, Profile, ProjectView, TaskStatus, TaskView } from '@/lib/types';
import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from '@/lib/constants';
import type { TaskInput } from '@/hooks/useWorkspace';
import TaskTrail from './TaskTrail';

interface Props {
  open: boolean;
  task: TaskView | null;
  defaultStatus: TaskStatus;
  clients: Client[];
  members: Profile[];
  projects: ProjectView[];
  onClose: () => void;
  onCreate: (input: TaskInput) => Promise<void>;
  onUpdate: (id: string, patch: Partial<TaskInput>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const emptyForm: TaskInput = {
  title: '',
  description: '',
  client_id: null,
  project_id: null,
  assignee_id: null,
  status: 'todo',
  priority: 'medium',
  due_date: null,
};

export default function TaskModal({
  open,
  task,
  defaultStatus,
  clients,
  members,
  projects,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const [form, setForm] = useState<TaskInput>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<'details' | 'activity'>('details');

  useEffect(() => {
    if (!open) return;
    setError('');
    setConfirmDelete(false);
    setTab('details');
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        client_id: task.client_id,
        project_id: task.project_id,
        assignee_id: task.assignee_id,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
      });
    } else {
      setForm({ ...emptyForm, status: defaultStatus });
    }
  }, [open, task, defaultStatus]);

  const availableProjects = useMemo(() => {
    if (!form.client_id) return projects;
    return projects.filter((p) => p.client_id === form.client_id || !p.client_id);
  }, [projects, form.client_id]);

  if (!open) return null;

  const isEdit = Boolean(task);

  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleClientChange = (value: string | null) =>
    setForm((prev) => {
      const stillValid =
        prev.project_id == null ||
        projects.some((p) => p.id === prev.project_id && (p.client_id === value || !p.client_id));
      return { ...prev, client_id: value, project_id: stillValid ? prev.project_id : null };
    });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Give the task a title so the team knows what to do.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload: TaskInput = { ...form, title: form.title.trim() };
      if (isEdit && task) {
        await onUpdate(task.id, payload);
      } else {
        await onCreate(payload);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the task. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    setBusy(true);
    try {
      await onDelete(task.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete the task.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors bg-white';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200">
        <div className="sticky top-0 bg-white z-10 border-b border-slate-100">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">{isEdit ? 'Edit task' : 'New task'}</h3>
              <p className="text-xs text-slate-400">
                {isEdit ? 'Update the details, owner or status.' : 'Capture the work so it is never forgotten.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 cursor-pointer"
              aria-label="Close"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {isEdit && (
            <div className="px-6 pb-3">
              <div className="inline-flex items-center gap-1 p-1 rounded-full bg-slate-100">
                <button
                  type="button"
                  onClick={() => setTab('details')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    tab === 'details' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <i className="ri-file-list-3-line text-sm"></i> Details
                </button>
                <button
                  type="button"
                  onClick={() => setTab('activity')}
                  className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                    tab === 'activity' ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <i className="ri-history-line text-sm"></i> Activity
                  {task && task.commentCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#1c2b3a] text-white text-[10px] font-bold">
                      {task.commentCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {isEdit && tab === 'activity' ? (
          <div className="px-6 py-5">
            <TaskTrail task={task as TaskView} members={members} clients={clients} />
            <div className="flex items-center justify-end pt-5 mt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Task title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Send the revised proposal to Northwind"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Details</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What exactly needs to happen?"
              className={`${inputClass} resize-none`}
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">{form.description.length}/500</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Client</label>
              <select
                value={form.client_id ?? ''}
                onChange={(e) => handleClientChange(e.target.value || null)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Internal / no client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Project</label>
              <select
                value={form.project_id ?? ''}
                onChange={(e) => set('project_id', e.target.value || null)}
                className={`${inputClass} cursor-pointer disabled:opacity-50`}
                disabled={availableProjects.length === 0}
              >
                <option value="">
                  {availableProjects.length === 0 ? 'No projects yet' : 'No project'}
                </option>
                {availableProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Owner</label>
              <select
                value={form.assignee_id ?? ''}
                onChange={(e) => set('assignee_id', e.target.value || null)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as TaskStatus)}
                className={`${inputClass} cursor-pointer`}
              >
                {STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set('priority', e.target.value as Priority)}
                className={`${inputClass} cursor-pointer`}
              >
                {PRIORITY_ORDER.slice().reverse().map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Due date</label>
            <input
              type="date"
              value={form.due_date ?? ''}
              onChange={(e) => set('due_date', e.target.value || null)}
              className={`${inputClass} cursor-pointer`}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <i className="ri-error-warning-line text-red-500 text-base mt-0.5"></i>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            {isEdit ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Delete this task?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={busy}
                    className="px-3 py-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
                  >
                    Yes, delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-2 rounded-md text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-delete-bin-6-line"></i> Delete
                </button>
              )
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                {busy && <i className="ri-loader-4-line animate-spin"></i>}
                {isEdit ? 'Save changes' : 'Create task'}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
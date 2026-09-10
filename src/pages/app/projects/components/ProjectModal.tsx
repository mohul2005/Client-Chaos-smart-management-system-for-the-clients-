import { useEffect, useState, type FormEvent } from 'react';
import type { Client, ProjectStatus, ProjectView } from '@/lib/types';
import { PROJECT_ACCENT_BG, PROJECT_COLORS, PROJECT_STATUS_META, PROJECT_STATUS_ORDER } from '@/lib/constants';
import type { ProjectInput } from '@/hooks/useWorkspace';

interface Props {
  open: boolean;
  project: ProjectView | null;
  clients: Client[];
  onClose: () => void;
  onSave: (id: string | null, input: ProjectInput) => Promise<void>;
}

const emptyForm: ProjectInput = {
  name: '',
  description: '',
  client_id: null,
  status: 'active',
  color: 'slate',
};

export default function ProjectModal({ open, project, clients, onClose, onSave }: Props) {
  const [form, setForm] = useState<ProjectInput>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (project) {
      setForm({
        name: project.name,
        description: project.description || '',
        client_id: project.client_id,
        status: project.status,
        color: project.color || 'slate',
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, project]);

  if (!open) return null;

  const isEdit = Boolean(project);

  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Give the project a name so the team knows what it is.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave(project?.id ?? null, { ...form, name: form.name.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the project. Please try again.');
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
        <div className="sticky top-0 bg-white z-10 border-b border-slate-100 flex items-center justify-between px-6 py-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">{isEdit ? 'Edit project' : 'New project'}</h3>
            <p className="text-xs text-slate-400">
              {isEdit ? 'Update the scope, client or status.' : 'Group related tasks under one project.'}
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

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Project name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Bluepeak — Checkout Revamp"
              className={inputClass}
              autoFocus
            />
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What is this project delivering?"
              className={`${inputClass} resize-none`}
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">{form.description.length}/500</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Client</label>
              <select
                value={form.client_id ?? ''}
                onChange={(e) => set('client_id', e.target.value || null)}
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
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value as ProjectStatus)}
                className={`${inputClass} cursor-pointer`}
              >
                {PROJECT_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Accent color</label>
            <div className="flex items-center gap-2.5">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('color', c)}
                  aria-label={`Use ${c} accent`}
                  className={`w-8 h-8 rounded-full ${PROJECT_ACCENT_BG[c] || PROJECT_ACCENT_BG.default} flex items-center justify-center transition-transform cursor-pointer ${
                    form.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-105' : 'hover:scale-105'
                  }`}
                >
                  {form.color === c && <i className="ri-check-line text-white text-base"></i>}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <i className="ri-error-warning-line text-red-500 text-base mt-0.5"></i>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
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
              {isEdit ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
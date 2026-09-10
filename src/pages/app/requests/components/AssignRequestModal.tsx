import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Client, Priority, Profile, RequestView } from '@/lib/types';
import { PRIORITY_META, PRIORITY_ORDER } from '@/lib/constants';
import type { AssignPayload } from '@/hooks/useRequests';

interface Props {
  open: boolean;
  request: RequestView | null;
  clients: Client[];
  members: Profile[];
  onClose: () => void;
  onAssign: (request: RequestView, payload: AssignPayload) => Promise<void>;
}

/** Try to match the request's free-text client name to a known client. */
function matchClient(name: string | null, clients: Client[]): string | null {
  if (!name) return null;
  const target = name.trim().toLowerCase();
  const exact = clients.find((c) => c.name.toLowerCase() === target);
  if (exact) return exact.id;
  const partial = clients.find(
    (c) => c.name.toLowerCase().includes(target) || target.includes(c.name.toLowerCase()),
  );
  return partial?.id ?? null;
}

export default function AssignRequestModal({ open, request, clients, members, onClose, onAssign }: Props) {
  const [clientId, setClientId] = useState<string>('');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const suggestedClient = useMemo(
    () => matchClient(request?.clientName ?? request?.client_name ?? null, clients),
    [request, clients],
  );

  useEffect(() => {
    if (!open || !request) return;
    setError('');
    setClientId(suggestedClient ?? '');
    setAssigneeId(request.assignee_id ?? '');
    setPriority(request.priority);
    setDueDate(request.due_date ?? '');
  }, [open, request, suggestedClient]);

  if (!open || !request) return null;

  const inputClass =
    'w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors bg-white cursor-pointer';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onAssign(request, {
        client_id: clientId || null,
        assignee_id: assigneeId || null,
        priority,
        due_date: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not assign the request.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div>
            <h3 className="font-bold text-base text-slate-900">Assign &amp; start work</h3>
            <p className="text-xs text-slate-400">Give it an owner and a deadline. It becomes a board task.</p>
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
          {/* Request summary */}
          <div className="px-3.5 py-3 rounded-md bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-900">{request.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              From {request.clientName || request.client_name || 'Unknown'} · {request.contact_email || 'no email'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Client</label>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
                <option value="">Internal / no client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {suggestedClient && clientId === suggestedClient && (
                <p className="mt-1 text-[11px] text-emerald-600">
                  <i className="ri-magic-line mr-1"></i>Matched to an existing client
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Owner</label>
              <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={inputClass}>
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name || m.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={inputClass}
              >
                {PRIORITY_ORDER.slice().reverse().map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-amber-50 border border-amber-200">
            <i className="ri-information-line text-amber-600 text-base mt-0.5"></i>
            <p className="text-xs text-amber-700 leading-relaxed">
              This request moves to <strong>In Progress</strong> and a task appears on the board, owned by whoever you
              pick. Nothing lands in a task list before this step.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <i className="ri-error-warning-line text-red-500 text-base mt-0.5"></i>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
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
              {busy ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-user-add-line"></i>}
              Assign &amp; start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
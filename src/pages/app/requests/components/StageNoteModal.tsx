import { useEffect, useState, type FormEvent } from 'react';
import type { RequestStatus, RequestView } from '@/lib/types';

interface Props {
  open: boolean;
  request: RequestView | null;
  mode: 'clarify' | 'waiting';
  onClose: () => void;
  onSave: (request: RequestView, status: RequestStatus, note: string) => Promise<void>;
}

const COPY = {
  clarify: {
    title: 'What do we need to clarify?',
    subtitle: 'A short note so anyone can see what we are asking the client for.',
    label: 'Open question',
    placeholder: 'e.g. Which three team members should be added, and do you have headshots?',
    status: 'needs_clarification' as RequestStatus,
    icon: 'ri-question-line',
  },
  waiting: {
    title: 'What are we waiting on?',
    subtitle: 'While paused on the client, this work will never count as overdue.',
    label: 'Waiting on the client for',
    placeholder: 'e.g. Final brand assets and the approved copy deck.',
    status: 'waiting_on_client' as RequestStatus,
    icon: 'ri-hourglass-2-line',
  },
};

export default function StageNoteModal({ open, request, mode, onClose, onSave }: Props) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const copy = COPY[mode];

  useEffect(() => {
    if (!open) return;
    setError('');
    setNote(request?.clarification_note ?? '');
  }, [open, mode, request]);

  if (!open || !request) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave(request, copy.status, note.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200">
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <i className={`${copy.icon} text-base text-slate-600`}></i>
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">{copy.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{copy.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 cursor-pointer shrink-0"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">{copy.label}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={300}
              autoFocus
              placeholder={copy.placeholder}
              className="w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors bg-white resize-none"
            />
            <p className="mt-1 text-[11px] text-slate-400 text-right">{note.length}/300</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <i className="ri-error-warning-line text-red-500 text-base mt-0.5"></i>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
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
              {busy ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { setAssignmentEmailDefault } from '@/lib/workspaceSettings';

interface Props {
  current: boolean;
  onSaved: (enabled: boolean) => Promise<void> | void;
}

/** Admin-only: the workspace-wide baseline that teammates inherit for assignment emails. */
export default function WorkspaceAssignmentCard({ current, onSaved }: Props) {
  const [enabled, setEnabled] = useState(current);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const toggle = async () => {
    if (busy) return;
    const next = !enabled;
    setEnabled(next);
    setBusy(true);
    setStatus('idle');
    setError('');
    const { error: err } = await setAssignmentEmailDefault(next);
    if (err) {
      setEnabled(!next);
      setError(err);
      setStatus('error');
      setBusy(false);
      return;
    }
    await onSaved(next);
    setStatus('saved');
    setBusy(false);
  };

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#1c2b3a] flex items-center justify-center shrink-0">
            <i className="ri-team-line text-lg text-white"></i>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 leading-tight">Workspace default</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1c2b3a] text-white">Admin</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              The baseline every teammate inherits for assignment emails
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Workspace default for assignment emails"
          onClick={toggle}
          disabled={busy}
          className={`relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer disabled:cursor-wait ${
            enabled ? 'bg-[#1c2b3a]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          ></span>
        </button>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600">
          {enabled ? 'New teammates get assignment emails by default' : 'Assignment emails are off by default'}
        </span>
        <span className="flex items-center gap-1.5 h-4">
          {busy && (
            <>
              <i className="ri-loader-4-line text-slate-400 animate-spin text-sm"></i>
              <span className="text-[11px] font-semibold text-slate-400">Saving</span>
            </>
          )}
          {!busy && status === 'saved' && (
            <>
              <i className="ri-checkbox-circle-line text-emerald-600 text-sm"></i>
              <span className="text-[11px] font-semibold text-emerald-700">Saved</span>
            </>
          )}
        </span>
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-lg bg-amber-50/70 border border-amber-100 px-4 py-3">
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
          <i className="ri-shield-user-line text-amber-600"></i>
        </div>
        <p className="text-xs text-amber-800/90 leading-relaxed">
          This sets the baseline for <strong>everyone</strong>. It only applies to teammates who haven&apos;t set
          their own preference — anyone who picks <strong>On</strong> or <strong>Mute</strong> on their own settings
          keeps that choice.
        </p>
      </div>

      {status === 'error' && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] leading-relaxed">
          <i className="ri-error-warning-line mt-0.5 shrink-0"></i>
          <span>{error || 'Could not save the workspace default. Please try again.'}</span>
        </div>
      )}
    </section>
  );
}
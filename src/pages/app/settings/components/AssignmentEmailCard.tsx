import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Props {
  userId: string;
  current: boolean;
  onSaved: (enabled: boolean) => Promise<void> | void;
}

/** Lets each teammate mute assignment emails independently of their daily reminders. */
export default function AssignmentEmailCard({ userId, current, onSaved }: Props) {
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
    const { error: err } = await supabase
      .from('profiles')
      .update({ assignment_emails: next })
      .eq('id', userId);
    if (err) {
      setEnabled(!next);
      setError(err.message);
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
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <i className="ri-user-add-line text-lg text-slate-500"></i>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-tight">Email me on assignment</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Get an email the moment a task is assigned to you
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Email me on assignment"
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
          {enabled ? 'Assignment emails are on' : 'Assignment emails are muted'}
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

      <div className="mt-3 flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
          <i className="ri-information-line text-slate-500"></i>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          This only affects <strong className="text-slate-700">assignment</strong> emails. Your daily due-date
          reminders above keep working either way, and new tasks still appear on your board.
        </p>
      </div>

      {status === 'error' && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[11px] leading-relaxed">
          <i className="ri-error-warning-line mt-0.5 shrink-0"></i>
          <span>{error || 'Could not save your preference. Please try again.'}</span>
        </div>
      )}
    </section>
  );
}
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { resolveAssignmentEmails } from '@/lib/workspaceSettings';

interface Props {
  userId: string;
  /** null = follow workspace default, true = always on, false = muted. */
  current: boolean | null;
  workspaceDefault: boolean;
  onSaved: (override: boolean | null) => Promise<void> | void;
}

const OPTIONS: { value: boolean | null; label: string }[] = [
  { value: null, label: 'Default' },
  { value: true, label: 'On' },
  { value: false, label: 'Mute' },
];

/** Lets each teammate control assignment emails — inherit the workspace default or override it. */
export default function AssignmentEmailCard({ userId, current, workspaceDefault, onSaved }: Props) {
  const [selected, setSelected] = useState<boolean | null>(current);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const effective = resolveAssignmentEmails(selected, workspaceDefault);

  const pick = async (value: boolean | null) => {
    if (value === selected || busy) return;
    setSelected(value);
    setBusy(true);
    setStatus('idle');
    setError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ assignment_emails_override: value })
      .eq('id', userId);
    if (err) {
      setSelected(selected);
      setError(err.message);
      setStatus('error');
      setBusy(false);
      return;
    }
    await onSaved(value);
    setStatus('saved');
    setBusy(false);
  };

  const caption =
    selected === null
      ? `Following the workspace default — currently ${workspaceDefault ? 'on' : 'muted'}.`
      : selected
        ? 'Always on for you, even if the workspace turns it off.'
        : 'Muted for you, even if the workspace default is on.';

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
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shrink-0 ${
            effective ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${effective ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          <span className={`text-[11px] font-semibold ${effective ? 'text-emerald-700' : 'text-slate-500'}`}>
            {effective ? 'On' : 'Muted'}
          </span>
        </span>
      </div>

      <div className="mt-5 inline-flex w-full sm:w-auto bg-slate-100 rounded-full p-1 gap-1">
        {OPTIONS.map((opt) => {
          const active = selected === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => pick(opt.value)}
              disabled={busy}
              aria-pressed={active}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:cursor-wait ${
                active ? 'bg-[#1c2b3a] text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 h-4">
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
      </div>

      <div className="mt-2 flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
          <i className="ri-information-line text-slate-500"></i>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          {caption}{' '}
          <strong className="text-slate-700">Assignment</strong> emails only — your daily due-date reminders keep
          working either way, and new tasks still appear on your board.
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
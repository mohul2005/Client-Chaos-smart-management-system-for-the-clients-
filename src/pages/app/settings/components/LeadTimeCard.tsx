import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const OPTIONS = [1, 2, 3];

interface Props {
  userId: string;
  current: number;
  onSaved: (days: number) => Promise<void> | void;
}

/** Lets each teammate choose how many days before a due date they get nudged. */
export default function LeadTimeCard({ userId, current, onSaved }: Props) {
  const [selected, setSelected] = useState(current);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  const handlePick = async (days: number) => {
    if (days === selected || busy) return;
    setSelected(days);
    setBusy(true);
    setStatus('idle');
    setError('');
    const { error: err } = await supabase
      .from('profiles')
      .update({ reminder_lead_days: days })
      .eq('id', userId);
    if (err) {
      setError(err.message);
      setStatus('error');
      setBusy(false);
      return;
    }
    await onSaved(days);
    setStatus('saved');
    setBusy(false);
  };

  const word = selected === 1 ? 'day' : 'days';

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#1c2b3a] flex items-center justify-center shrink-0">
            <i className="ri-alarm-line text-lg text-white"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-tight">Reminder lead time</h3>
            <p className="text-xs text-slate-400">How early you want your due-date nudge</p>
          </div>
        </div>
        {status === 'saved' && !busy && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
            <i className="ri-checkbox-circle-line text-emerald-600 text-sm"></i>
            <span className="text-[11px] font-semibold text-emerald-700">Saved</span>
          </span>
        )}
        {busy && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 shrink-0">
            <i className="ri-loader-4-line text-slate-500 animate-spin text-sm"></i>
            <span className="text-[11px] font-semibold text-slate-500">Saving</span>
          </span>
        )}
      </div>

      <div className="inline-flex w-full sm:w-auto bg-slate-100 rounded-full p-1 gap-1">
        {OPTIONS.map((days) => {
          const active = selected === days;
          return (
            <button
              key={days}
              type="button"
              onClick={() => handlePick(days)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                active ? 'bg-[#1c2b3a] text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {days} {days === 1 ? 'day' : 'days'}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
        <div className="w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
          <i className="ri-mail-send-line text-slate-500"></i>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          We&apos;ll email you <strong className="text-slate-700">{selected} {word}</strong> before a task is due.
          Anything already overdue is always included, every day until it&apos;s done.
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
import { useState } from 'react';
import { sendDueReminders, type NotifyResult } from '@/lib/notifications';

interface Props {
  overdueCount: number;
  dueSoonCount: number;
}

/** Overview card: shows the email reminder status and lets you fire a sweep on demand. */
export default function ReminderPanel({ overdueCount, dueSoonCount }: Props) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<NotifyResult | null>(null);

  const atRisk = overdueCount + dueSoonCount;

  const handleSend = async () => {
    setBusy(true);
    setResult(null);
    const res = await sendDueReminders();
    setResult(res);
    setBusy(false);
  };

  const sentCount = result?.sent ?? 0;
  const failed = result != null && !result.ok;

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#1c2b3a] flex items-center justify-center shrink-0">
            <i className="ri-mail-send-line text-base text-white"></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">Email reminders</h3>
            <p className="text-[11px] text-slate-400">Automatic, so nothing slips</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-semibold text-emerald-700">On</span>
        </span>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-4">
        Owners get an email the moment a task is assigned to them, plus a daily nudge before a due date slips.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2">
          <p className="text-lg font-black text-red-600 leading-none">{overdueCount}</p>
          <p className="text-[11px] text-red-500 mt-1">Overdue now</p>
        </div>
        <div className="rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
          <p className="text-lg font-black text-amber-600 leading-none">{dueSoonCount}</p>
          <p className="text-[11px] text-amber-600 mt-1">Due soon</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#1c2b3a] text-white text-xs font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {busy ? (
          <>
            <i className="ri-loader-4-line animate-spin"></i> Sending…
          </>
        ) : (
          <>
            <i className="ri-notification-3-line"></i>
            {atRisk > 0 ? `Send reminders for ${atRisk} task${atRisk === 1 ? '' : 's'}` : 'Send reminders now'}
          </>
        )}
      </button>

      {result && (
        <div
          className={`mt-3 flex items-start gap-2 px-3 py-2 rounded-lg text-[11px] leading-relaxed ${
            failed ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          <i className={`${failed ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'} mt-0.5 shrink-0`}></i>
          <span>
            {failed
              ? result?.error || 'Could not send reminders right now.'
              : sentCount > 0
                ? `Sent ${sentCount} reminder email${sentCount === 1 ? '' : 's'}.`
                : 'Everyone is up to date — nothing to nudge.'}
          </span>
        </div>
      )}
    </section>
  );
}
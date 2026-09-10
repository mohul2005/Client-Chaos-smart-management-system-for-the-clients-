import { Link } from 'react-router-dom';
import type { RequestBucket } from '@/lib/types';
import { REQUEST_BUCKET_META } from '@/lib/constants';

interface Props {
  counts: Record<RequestBucket, number>;
}

/** The buckets a manager scans first; "going quiet" is surfaced separately below. */
const CORE_BUCKETS: RequestBucket[] = ['waiting_for_us', 'waiting_for_client', 'unassigned', 'overdue'];

/** Overview card: the request buckets a manager cares about, at a glance. */
export default function TriagePanel({ counts }: Props) {
  const total = CORE_BUCKETS.reduce((sum, b) => sum + counts[b], 0) + counts.going_quiet;

  return (
    <section className="bg-[#1c2b3a] rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
          <i className="ri-flow-chart"></i>
        </div>
        <h3 className="font-bold text-sm">Request pipeline</h3>
      </div>
      <p className="text-[11px] text-white/50 mb-4">Who is owed the next move</p>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {CORE_BUCKETS.map((bucket) => {
          const meta = REQUEST_BUCKET_META[bucket];
          return (
            <div key={bucket} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-1">
                <i className={`${meta.icon} text-xs text-white/50`}></i>
                <span className="text-[10px] text-white/50 truncate">{meta.label}</span>
              </div>
              <p className="text-lg font-black leading-none">{counts[bucket]}</p>
            </div>
          );
        })}
      </div>

      {counts.going_quiet > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-orange-500/15 border border-orange-400/30 px-3 py-2">
          <i className="ri-timer-flash-line text-orange-300 text-sm shrink-0"></i>
          <p className="text-[11px] text-orange-100 leading-snug">
            <strong className="font-bold">{counts.going_quiet}</strong> going quiet — waiting on the client 7+ days
          </p>
        </div>
      )}

      <p className="text-[11px] text-white/40 mb-4 leading-relaxed">
        {total === 0
          ? 'Everything is handled — nothing waiting on us or the client.'
          : 'Waiting-on-client work never counts as overdue.'}
      </p>

      <Link
        to="/app/requests"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white text-[#1c2b3a] text-sm font-semibold hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
      >
        {counts.waiting_for_us > 0 ? `Review ${counts.waiting_for_us} waiting on us` : 'Open request inbox'}
        <i className="ri-arrow-right-line"></i>
      </Link>
    </section>
  );
}
import type { RequestBucket } from '@/lib/types';
import { REQUEST_BUCKET_META, REQUEST_BUCKET_ORDER } from '@/lib/constants';

interface Props {
  counts: Record<RequestBucket, number>;
  active: RequestBucket | null;
  onSelect: (bucket: RequestBucket | null) => void;
}

/** The manager's at-a-glance view: who owes what, and what's actually at risk. */
export default function RequestBucketCards({ counts, active, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-5">
      {REQUEST_BUCKET_ORDER.map((bucket) => {
        const meta = REQUEST_BUCKET_META[bucket];
        const isActive = active === bucket;
        return (
          <button
            key={bucket}
            type="button"
            onClick={() => onSelect(isActive ? null : bucket)}
            className={`text-left rounded-lg border p-4 transition-colors cursor-pointer ${
              isActive ? 'border-[#1c2b3a] bg-white' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{meta.label}</span>
              <div className={`w-7 h-7 rounded-md ${meta.bg} border ${meta.ring} flex items-center justify-center`}>
                <i className={`${meta.icon} text-base ${meta.text}`}></i>
              </div>
            </div>
            <p className={`text-2xl font-black ${meta.text}`}>{counts[bucket]}</p>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">{meta.description}</p>
          </button>
        );
      })}
    </div>
  );
}
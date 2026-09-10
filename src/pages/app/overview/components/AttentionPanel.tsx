import { Link } from 'react-router-dom';
import type { TaskView } from '@/lib/types';
import { STATUS_META } from '@/lib/constants';
import { dueMeta } from '@/lib/format';

interface Props {
  items: TaskView[];
}

export default function AttentionPanel({ items }: Props) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <i className="ri-fire-line text-red-500"></i>
          </div>
          <h3 className="font-bold text-sm text-slate-900">Needs attention</h3>
        </div>
        <Link to="/app/board" className="text-[11px] font-semibold text-[#1c2b3a] hover:underline cursor-pointer whitespace-nowrap">
          View board
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
            <i className="ri-checkbox-circle-line text-xl text-emerald-600"></i>
          </div>
          <p className="text-sm text-slate-500">Nothing overdue or due soon. Nice.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {items.map((t) => {
            const due = dueMeta(t.due_date);
            const danger = due.tone === 'danger';
            return (
              <div key={t.id} className="py-3 flex items-center gap-3 first:pt-0 last:pb-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_META[t.status].dot}`}></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{t.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {t.clientName || 'Internal'}{t.assigneeName ? ` • ${t.assigneeName}` : ' • Unassigned'}
                  </p>
                </div>
                <span
                  className={`shrink-0 px-2 py-1 rounded-md text-[10px] font-bold border whitespace-nowrap ${
                    danger
                      ? 'bg-red-50 text-red-600 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {due.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
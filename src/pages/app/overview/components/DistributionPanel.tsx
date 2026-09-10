import { PRIORITY_META, PRIORITY_ORDER, STATUS_META, STATUS_ORDER } from '@/lib/constants';

interface Props {
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  total: number;
  openTotal: number;
}

export default function DistributionPanel({ statusCounts, priorityCounts, total, openTotal }: Props) {
  const pct = (n: number, base: number) => (base > 0 ? Math.round((n / base) * 100) : 0);

  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
          <i className="ri-bar-chart-2-line text-slate-600"></i>
        </div>
        <h3 className="font-bold text-sm text-slate-900">Pipeline breakdown</h3>
      </div>

      {/* Stacked status bar */}
      <div className="h-2.5 rounded-full overflow-hidden flex bg-slate-100 mb-4">
        {STATUS_ORDER.map((s) => {
          const w = pct(statusCounts[s] || 0, total);
          if (!w) return null;
          return <div key={s} className={STATUS_META[s].dot} style={{ width: `${w}%` }} />;
        })}
      </div>

      {/* Status legend */}
      <div className="flex flex-col gap-2.5 mb-5">
        {STATUS_ORDER.map((s) => {
          const count = statusCounts[s] || 0;
          return (
            <div key={s} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${STATUS_META[s].dot}`}></span>
              <span className="text-xs text-slate-600 flex-1">{STATUS_META[s].label}</span>
              <span className="text-xs font-bold text-slate-800">{count}</span>
              <span className="text-[11px] text-slate-400 w-9 text-right">{pct(count, total)}%</span>
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <p className="text-[11px] font-bold tracking-wide uppercase text-slate-400 mb-3">Open by priority</p>
        <div className="flex flex-col gap-2.5">
          {PRIORITY_ORDER.map((p) => {
            const count = priorityCounts[p] || 0;
            return (
              <div key={p} className="flex items-center gap-2">
                <span className={`text-xs flex-1 ${PRIORITY_META[p].text}`}>{PRIORITY_META[p].label}</span>
                <div className="w-20 sm:w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${count > 0 ? 'bg-[#1c2b3a]' : ''}`}
                    style={{ width: `${pct(count, openTotal)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-800 w-5 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
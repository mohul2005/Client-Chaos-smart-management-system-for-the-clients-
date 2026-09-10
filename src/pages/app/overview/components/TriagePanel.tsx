import { Link } from 'react-router-dom';

interface Props {
  newCount: number;
  triaged: number;
  converted: number;
  declined: number;
}

export default function TriagePanel({ newCount, triaged, converted, declined }: Props) {
  const total = newCount + triaged + converted + declined;
  const rows = [
    { label: 'New', value: newCount, dot: 'bg-amber-500' },
    { label: 'Triaged', value: triaged, dot: 'bg-slate-400' },
    { label: 'Converted', value: converted, dot: 'bg-emerald-500' },
    { label: 'Declined', value: declined, dot: 'bg-red-400' },
  ];

  return (
    <section className="bg-[#1c2b3a] rounded-xl p-5 text-white">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
          <i className="ri-inbox-archive-line"></i>
        </div>
        <h3 className="font-bold text-sm">Request inbox</h3>
      </div>
      <p className="text-[11px] text-white/50 mb-4">
        {total} request{total === 1 ? '' : 's'} received
      </p>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {rows.map((r) => (
          <div key={r.label} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${r.dot}`}></span>
              <span className="text-[10px] text-white/50">{r.label}</span>
            </div>
            <p className="text-lg font-black leading-none">{r.value}</p>
          </div>
        ))}
      </div>

      <Link
        to="/app/requests"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md bg-white text-[#1c2b3a] text-sm font-semibold hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
      >
        {newCount > 0 ? `Triage ${newCount} new` : 'Open inbox'}
        <i className="ri-arrow-right-line"></i>
      </Link>
    </section>
  );
}
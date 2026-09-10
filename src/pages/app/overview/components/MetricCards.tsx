export interface Metric {
  label: string;
  value: number | string;
  icon: string;
  valueTone: string;
  iconTone: string;
  iconBg: string;
  hint: string;
}

interface Props {
  metrics: Metric[];
}

export default function MetricCards({ metrics }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-5">
      {metrics.map((m) => (
        <div key={m.label} className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">{m.label}</span>
            <div className={`w-8 h-8 rounded-lg ${m.iconBg} flex items-center justify-center`}>
              <i className={`${m.icon} text-base ${m.iconTone}`}></i>
            </div>
          </div>
          <p className={`text-2xl md:text-3xl font-black leading-none ${m.valueTone}`}>{m.value}</p>
          <p className="text-[11px] text-slate-400 mt-2">{m.hint}</p>
        </div>
      ))}
    </div>
  );
}
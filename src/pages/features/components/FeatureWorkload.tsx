import { memo } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const allocations = [
  { member: 'Sarah K.', role: 'Engineering Lead', tasks: 12, capacity: 70, color: '#5b9ec9' },
  { member: 'James R.', role: 'Product Designer', tasks: 8, capacity: 55, color: '#5b9ec9' },
  { member: 'Aisha M.', role: 'Frontend Dev', tasks: 15, capacity: 90, color: '#e07a5f' },
  { member: 'David L.', role: 'QA Engineer', tasks: 6, capacity: 40, color: '#5b9ec9' },
  { member: 'Yuki T.', role: 'Backend Dev', tasks: 10, capacity: 65, color: '#81b29a' },
];

const FeatureWorkload = memo(() => {
  const headerRef = useScrollAnimation<HTMLDivElement>();
  const contentRef = useScrollAnimation<HTMLDivElement>();
  const diagramRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="w-full bg-[#eaf0f6] py-20 md:py-28 px-6 md:px-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="fade-up mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-px bg-[#8896a4]" />
            <span className="text-xs font-medium tracking-[0.18em] text-[#8896a4] uppercase">
              Team Capacity
            </span>
          </div>
          <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold text-[#1c2b3a] leading-[1.15] tracking-tight max-w-xl">
            Balance Workloads Without Burning Anyone Out
          </h2>
        </div>

        {/* Business diagram — horizontal bar workload chart */}
        <div ref={diagramRef} className="fade-up">
          <div className="text-center mb-8">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#8896a4]">
              Weekly Task Allocation
            </span>
          </div>
          <div className="bg-white border border-[#e4eaf1] rounded-xl p-6 md:p-8 shadow-sm">
            {allocations.map((a) => (
              <div key={a.member} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-5 last:mb-0">
                <div className="sm:w-32 flex items-center gap-2.5 flex-shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: a.color }}
                  >
                    {a.member.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#1c2b3a]">{a.member}</div>
                    <div className="text-[10px] text-[#8896a4]">{a.role}</div>
                  </div>
                </div>
                <div className="flex-1 flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full bg-[#e4eaf1] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${a.capacity}%`,
                        backgroundColor: a.color,
                        opacity: a.capacity > 85 ? 0.85 : 1,
                      }}
                    />
                  </div>
                  <div className="w-14 text-right">
                    <span className="text-sm font-bold text-[#1c2b3a]">{a.capacity}%</span>
                  </div>
                </div>
              </div>
            ))}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-5 border-t border-[#e4eaf1] text-xs text-[#8896a4]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#5b9ec9]" />
                <span>Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#81b29a]" />
                <span>Optimal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e07a5f] opacity-85" />
                <span>Nearing Cap</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default FeatureWorkload;
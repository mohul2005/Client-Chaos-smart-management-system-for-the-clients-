import { memo } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const stats = [
  {
    icon: 'ri-rocket-2-line',
    value: '3.2×',
    label: 'Faster Delivery',
    detail: 'Teams ship features 3.2× faster after switching to TASKS.',
  },
  {
    icon: 'ri-user-follow-line',
    value: '94%',
    label: 'Adoption Rate',
    detail: 'New team members are fully onboarded within their first week.',
  },
  {
    icon: 'ri-time-line',
    value: '12h/wk',
    label: 'Time Saved',
    detail: 'Average weekly hours reclaimed from status meetings and email.',
  },
  {
    icon: 'ri-shield-check-line',
    value: '99.9%',
    label: 'Uptime SLA',
    detail: 'Enterprise-grade reliability with zero unplanned downtime.',
  },
  {
    icon: 'ri-group-line',
    value: '50K+',
    label: 'Active Teams',
    detail: 'From startups to Fortune 500s, teams trust TASKS. daily.',
  },
  {
    icon: 'ri-star-smile-line',
    value: '4.9',
    label: 'User Rating',
    detail: 'Consistently rated the highest across all PM platforms.',
  },
];

const FeatureStats = memo(() => {
  const headerRef = useScrollAnimation<HTMLDivElement>();
  const gridRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="w-full bg-white py-20 md:py-28 px-6 md:px-12">
      <div className="w-full max-w-7xl mx-auto">
        <div ref={headerRef} className="fade-up mb-14 md:mb-18">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-px bg-[#8896a4]" />
            <span className="text-xs font-medium tracking-[0.18em] text-[#8896a4] uppercase">
              By the Numbers
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold text-[#1c2b3a] leading-[1.15] tracking-tight max-w-xl">
              Results That Speak for Themselves
            </h2>
          </div>
        </div>

        {/* Single observer on parent — CSS nth-child handles stagger */}
        <div ref={gridRef} className="stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 fade-up">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border border-[#e4eaf1] rounded-xl p-6 md:p-8 hover:border-[#c8d8e8] hover:bg-[#f4f6f9] transition-all duration-300 group"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#eaf0f6] text-[#1c2b3a] text-xl mb-5 group-hover:bg-[#1c2b3a] group-hover:text-white transition-colors duration-300">
                <i className={stat.icon} />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-[#1c2b3a] mb-2">{stat.value}</div>
              <div className="font-bold text-[#1c2b3a] text-base mb-2">{stat.label}</div>
              <p className="text-sm text-[#8896a4] leading-relaxed">{stat.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default FeatureStats;

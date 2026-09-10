import { useState, useRef, useEffect } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    id: '01',
    icon: 'ri-dashboard-3-line',
    title: 'Unified Dashboard',
    desc: 'All projects, deadlines, and team activity in one command center. No more tab-switching.',
    stat: '94%',
    statLabel: 'Visibility Gain',
    progress: 94,
    tag: 'Core',
    color: '#1c2b3a',
  },
  {
    id: '02',
    icon: 'ri-team-line',
    title: 'Smart Assignment',
    desc: 'AI-powered workload balancing assigns tasks to the right person at the right time.',
    stat: '3.2×',
    statLabel: 'Faster Delivery',
    progress: 78,
    tag: 'AI',
    color: '#2d4a6b',
  },
  {
    id: '03',
    icon: 'ri-bar-chart-grouped-line',
    title: 'Real-time Analytics',
    desc: 'Live progress tracking with burndown charts, velocity metrics, and bottleneck alerts.',
    stat: '99.9%',
    statLabel: 'Uptime SLA',
    progress: 99,
    tag: 'Analytics',
    color: '#3a5f82',
  },
];

interface ProgressBarProps {
  value: number;
  active: boolean;
}

const ProgressBar = ({ value, active }: ProgressBarProps) => {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (active) {
      const t = setTimeout(() => setWidth(value), 200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [active, value]);

  return (
    <div className="w-full h-1 bg-[#c8d8e8] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-[#1c2b3a]"
        style={{ width: `${width}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </div>
  );
};

interface FeatureCardProps {
  feature: typeof features[0];
  index: number;
  active: boolean;
  onClick: () => void;
}

const FeatureCard = ({ feature, index, active, onClick }: FeatureCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left group relative rounded-xl border transition-all duration-500 cursor-pointer overflow-hidden ${
      active
        ? 'bg-[#1c2b3a] border-[#1c2b3a] shadow-lg'
        : 'bg-white/60 border-[#c8d8e8] hover:bg-white hover:border-[#8aafc8]'
    }`}
    style={{ transitionProperty: 'background,border-color,box-shadow,transform' }}
  >
    {/* grid dot pattern overlay */}
    {active && (
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '18px 18px',
        }}
      />
    )}

    <div className="relative p-5 md:p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-colors duration-300 ${
              active ? 'bg-white/15 text-white' : 'bg-[#eaf0f6] text-[#1c2b3a]'
            }`}
          >
            <i className={feature.icon} />
          </div>
          <span
            className={`text-xs font-mono font-semibold tracking-widest ${
              active ? 'text-white/40' : 'text-[#8aafc8]'
            }`}
          >
            {feature.id}
          </span>
        </div>
        <span
          className={`text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full border ${
            active
              ? 'border-white/20 text-white/60 bg-white/10'
              : 'border-[#c8d8e8] text-[#5a7a96] bg-[#eaf0f6]'
          }`}
        >
          {feature.tag}
        </span>
      </div>

      <h3
        className={`text-base font-bold mb-2 transition-colors duration-300 ${
          active ? 'text-white' : 'text-[#1c2b3a]'
        }`}
      >
        {feature.title}
      </h3>
      <p
        className={`text-sm leading-relaxed mb-5 transition-colors duration-300 ${
          active ? 'text-white/60' : 'text-[#5a7a96]'
        }`}
      >
        {feature.desc}
      </p>

      <div className="flex items-end justify-between mb-2">
        <span
          className={`text-2xl font-black font-mono transition-colors duration-300 ${
            active ? 'text-white' : 'text-[#1c2b3a]'
          }`}
        >
          {feature.stat}
        </span>
        <span
          className={`text-xs transition-colors duration-300 ${
            active ? 'text-white/50' : 'text-[#8aafc8]'
          }`}
        >
          {feature.statLabel}
        </span>
      </div>
      <ProgressBar value={feature.progress} active={active || index === 0} />
    </div>
  </button>
);

const FeatureStreamline = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const headerRef = useScrollAnimation<HTMLDivElement>();
  const gridRef = useScrollAnimation<HTMLDivElement>({ rootMargin: '0px 0px -60px 0px' });
  const previewRef = useRef<HTMLDivElement>(null);

  // auto-cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const active = features[activeIndex];

  return (
    <section
      className="w-full bg-[#eaf0f6] py-20 md:py-32 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Background grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(#c8d8e8 1px, transparent 1px), linear-gradient(90deg, #c8d8e8 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Radial fade overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,#eaf0f6_100%)]" />

      <div className="relative w-full">
        {/* Header */}
        <div ref={headerRef} className="fade-up mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#1c2b3a]" />
            <span className="text-xs font-mono font-semibold tracking-[0.2em] text-[#5a7a96] uppercase">
              Core Features
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-4xl md:text-6xl font-black text-[#1c2b3a] leading-[1.05] max-w-2xl">
              Streamline Every<br />
              <span className="relative inline-block">
                Project
                <span
                  className="absolute -bottom-1 left-0 w-full h-1 bg-[#1c2b3a] rounded-full"
                  style={{ transform: 'scaleX(1)', transformOrigin: 'left' }}
                />
              </span>
              , Effortlessly
            </h2>
          </div>
        </div>

        {/* Main content: cards left + preview right */}
        <div ref={gridRef} className="fade-up flex flex-col xl:flex-row xl:items-stretch gap-8 xl:gap-12">
          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4 xl:w-[420px] xl:flex-shrink-0">
            {features.map((f, i) => (
              <FeatureCard
                key={f.id}
                feature={f}
                index={i}
                active={activeIndex === i}
                onClick={() => setActiveIndex(i)}
              />
            ))}
          </div>

          {/* Right: large preview panel */}
          <div className="flex-1 flex flex-col gap-6 xl:min-h-0">
            {/* Main visual */}
            <div
              ref={previewRef}
              className="relative rounded-2xl overflow-hidden border border-[#c8d8e8] bg-white/40 flex-1"
              style={{ minHeight: '420px' }}
            >
              {/* Dot grid inside panel */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(circle, #8aafc8 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Image */}
              <div className="absolute inset-0">
                {features.map((f, i) => (
                  <img
                    key={f.id}
                    src={
                      i === 0
                        ? 'https://readdy.ai/api/search-image?query=sleek%20modern%20project%20management%20dashboard%20interface%20on%20large%20monitor%2C%20dark%20navy%20UI%20with%20glowing%20data%20charts%2C%20task%20boards%2C%20progress%20rings%2C%20team%20avatars%2C%20cool%20blue%20gray%20color%20scheme%2C%20ultra%20clean%20minimal%20design%2C%20tech%20startup%20office%20environment%2C%20professional%20workspace&width=900&height=560&seq=sf-preview-01&orientation=landscape'
                        : i === 1
                        ? 'https://readdy.ai/api/search-image?query=AI-powered%20team%20workload%20assignment%20interface%20on%20screen%2C%20smart%20scheduling%20visualization%2C%20person%20avatars%20with%20task%20allocation%20bars%2C%20dark%20navy%20and%20steel%20blue%20UI%2C%20data-driven%20design%2C%20modern%20tech%20office%20background%2C%20cool%20tones&width=900&height=560&seq=sf-preview-02&orientation=landscape'
                        : 'https://readdy.ai/api/search-image?query=real-time%20analytics%20dashboard%20with%20burndown%20charts%20velocity%20graphs%20and%20KPI%20metrics%2C%20dark%20navy%20interface%20glowing%20data%20visualizations%2C%20multiple%20monitors%20in%20modern%20office%2C%20cool%20blue%20gray%20professional%20environment&width=900&height=560&seq=sf-preview-03&orientation=landscape'
                    }
                    alt={f.title}
                    className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700"
                    style={{ opacity: activeIndex === i ? 1 : 0 }}
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    width="900"
                    height="560"
                  />
                ))}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1c2b3a]/60 via-transparent to-transparent pointer-events-none" />

                {/* Active feature label */}
                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <div className="text-white/50 text-xs font-mono mb-1 tracking-widest">
                      FEATURE {active.id}
                    </div>
                    <div className="text-white text-xl font-bold">{active.title}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-3xl font-black font-mono">{active.stat}</div>
                    <div className="text-white/50 text-xs">{active.statLabel}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress indicator dots */}
            <div className="flex items-center gap-2 justify-center xl:justify-start">
              {features.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`rounded-full transition-all duration-500 cursor-pointer ${
                    activeIndex === i
                      ? 'w-8 h-2 bg-[#1c2b3a]'
                      : 'w-2 h-2 bg-[#c8d8e8] hover:bg-[#8aafc8]'
                  }`}
                />
              ))}
            </div>

            {/* Bottom row: mini stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Teams', value: '50K+', icon: 'ri-group-line' },
                { label: 'Tasks Completed', value: '12M+', icon: 'ri-checkbox-circle-line' },
                { label: 'Avg. Time Saved', value: '60%', icon: 'ri-time-line' },
                { label: 'Satisfaction', value: '98%', icon: 'ri-star-line' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/60 border border-[#c8d8e8] rounded-xl p-4 flex flex-col gap-2 hover:bg-white hover:border-[#8aafc8] transition-all duration-300 group"
                >
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#eaf0f6] text-[#1c2b3a] text-base group-hover:bg-[#1c2b3a] group-hover:text-white transition-colors duration-300">
                    <i className={s.icon} />
                  </div>
                  <div className="text-2xl font-black font-mono text-[#1c2b3a]">{s.value}</div>
                  <div className="text-xs text-[#8aafc8] font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureStreamline;
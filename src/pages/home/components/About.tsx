import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const stats = [
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '3.2×', label: 'Faster Delivery' },
  { value: '50K+', label: 'Teams Worldwide' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const About = () => {
  const leftRef = useScrollAnimation<HTMLDivElement>({ rootMargin: '0px 0px -60px 0px' });
  const rightRef = useScrollAnimation<HTMLDivElement>({ rootMargin: '0px 0px -60px 0px' });

  return (
    <section id="about" className="w-full bg-[#eaf0f6] overflow-hidden">
      <div className="w-full flex flex-col lg:flex-row min-h-[640px]">

        {/* ── Left: full-bleed image ── */}
        <div
          ref={leftRef}
          className="w-full lg:w-[52%] relative overflow-hidden slide-left"
          style={{ minHeight: '420px' }}
        >
          <img
            src="https://readdy.ai/api/search-image?query=modern%20open%20office%20workspace%20with%20large%20monitors%20showing%20project%20management%20dashboards%2C%20team%20of%20professionals%20collaborating%20around%20a%20table%2C%20cool%20blue%20gray%20interior%20design%2C%20natural%20light%20from%20floor%20to%20ceiling%20windows%2C%20minimalist%20tech%20startup%20environment%2C%20high%20resolution%20editorial%20photography%2C%20cinematic%20wide%20angle&width=900&height=700&seq=about-hero-img-001&orientation=portrait"
            alt="Team collaboration at TASKS."
            className="w-full h-full object-cover object-center"
            style={{ minHeight: '420px' }}
          />

          {/* Floating stat badge */}
          <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur-sm rounded-2xl px-5 py-4 flex items-center gap-4">
            <div className="w-10 h-10 flex items-center justify-center bg-[#1c2b3a] rounded-xl">
              <i className="ri-team-line text-white text-lg"></i>
            </div>
            <div>
              <p className="font-black text-gray-900 text-xl leading-none">50,000+</p>
              <p className="text-xs text-gray-500 mt-0.5">Teams trust TASKS.</p>
            </div>
          </div>
        </div>

        {/* ── Right: text content ── */}
        <div
          ref={rightRef}
          className="w-full lg:w-[48%] flex flex-col justify-center px-10 md:px-16 py-16 lg:py-20 slide-right relative overflow-hidden"
        >
          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.02]"
            style={{
              backgroundImage:
                'linear-gradient(#1c2b3a 1px, transparent 1px), linear-gradient(90deg, #1c2b3a 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Corner dot accent top-right */}
          <div
            className="absolute top-0 right-0 w-32 h-32 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'radial-gradient(circle, #1c2b3a 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />
          {/* Corner dot accent bottom-left */}
          <div
            className="absolute bottom-0 left-0 w-24 h-24 pointer-events-none opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #1c2b3a 1.5px, transparent 1.5px)',
              backgroundSize: '16px 16px',
            }}
          />
          {/* Label */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#1c2b3a]" />
            <span className="text-xs font-bold tracking-widest text-[#1c2b3a]/60 uppercase">
              About TASKS.
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-black text-4xl md:text-5xl text-gray-900 leading-tight mb-6">
            From Chaos<br />to Clarity.
          </h2>

          {/* Body */}
          <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-md">
            TASKS. was born from a simple frustration — too many tools, too little focus. We built a unified workspace where every task, deadline, and team member stays perfectly in sync. No scattered spreadsheets, no missed handoffs. Just clean, focused execution.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-xl px-5 py-4 flex flex-col gap-1"
              >
                <span className="font-black text-2xl text-gray-900 leading-none">{s.value}</span>
                <span className="text-xs text-gray-400 font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button className="flex items-center gap-3 text-sm font-bold text-gray-900 hover:gap-5 transition-all duration-200 cursor-pointer whitespace-nowrap group w-fit">
            Our Story
            <span className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-all">
              <i className="ri-arrow-right-line text-sm"></i>
            </span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default About;

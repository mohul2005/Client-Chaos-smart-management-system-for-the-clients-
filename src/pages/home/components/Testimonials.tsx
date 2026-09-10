import { useState, useEffect, useRef } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Product',
    company: 'Nexlify',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20asian%20woman%20portrait%2C%20confident%20smile%2C%20modern%20office%20background%2C%20cool%20blue%20gray%20tones%2C%20business%20casual%2C%20clean%20minimal%20photography%2C%20soft%20natural%20light%2C%20high%20quality%20headshot&width=120&height=120&seq=avatar-01&orientation=squarish',
    quote: 'TASKS. completely transformed how our product team operates. We cut our sprint planning time in half and finally have full visibility into who\'s blocked and why. It\'s the one tool I\'d never give up.',
    rating: 5,
    stat: '2× faster sprints',
  },
  {
    name: 'Marcus Webb',
    role: 'Engineering Manager',
    company: 'Stackr',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20black%20man%20portrait%2C%20confident%20expression%2C%20modern%20tech%20office%20background%2C%20cool%20blue%20gray%20tones%2C%20business%20casual%20attire%2C%20clean%20minimal%20photography%2C%20soft%20natural%20light%2C%20high%20quality%20headshot&width=120&height=120&seq=avatar-02&orientation=squarish',
    quote: 'We tried five different project tools before landing on TASKS. The automation features alone saved us hours every week. Our engineers actually enjoy updating their tasks now — that says everything.',
    rating: 5,
    stat: '8 hrs saved / week',
  },
  {
    name: 'Priya Nair',
    role: 'COO',
    company: 'Brightloop',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20indian%20woman%20portrait%2C%20warm%20confident%20smile%2C%20modern%20office%20background%2C%20cool%20blue%20gray%20tones%2C%20business%20formal%20attire%2C%20clean%20minimal%20photography%2C%20soft%20natural%20light%2C%20high%20quality%20headshot&width=120&height=120&seq=avatar-03&orientation=squarish',
    quote: 'The reporting dashboards gave our leadership team the clarity we\'d been missing for years. We can now make resourcing decisions in minutes instead of days. TASKS. is genuinely a competitive advantage.',
    rating: 5,
    stat: '3× faster decisions',
  },
  {
    name: 'James Okafor',
    role: 'VP of Engineering',
    company: 'Veltrix',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%2C%20thoughtful%20expression%2C%20modern%20tech%20startup%20office%20background%2C%20cool%20blue%20gray%20tones%2C%20business%20casual%2C%20clean%20minimal%20photography%2C%20soft%20natural%20light%2C%20high%20quality%20headshot&width=120&height=120&seq=avatar-04&orientation=squarish',
    quote: 'Onboarding new engineers used to take weeks. With TASKS., they\'re contributing to live projects on day two. The clarity of the workflow and the smart assignment system is unmatched.',
    rating: 5,
    stat: 'Day-2 onboarding',
  },
  {
    name: 'Lena Hoffmann',
    role: 'Product Lead',
    company: 'Claritex',
    avatar: 'https://readdy.ai/api/search-image?query=professional%20european%20woman%20portrait%2C%20focused%20expression%2C%20modern%20office%20background%2C%20cool%20blue%20gray%20tones%2C%20business%20casual%20attire%2C%20clean%20minimal%20photography%2C%20soft%20natural%20light%2C%20high%20quality%20headshot&width=120&height=120&seq=avatar-05&orientation=squarish',
    quote: 'We scaled from 12 to 80 people without losing any operational clarity. TASKS. grew with us every step of the way. I can\'t imagine managing a team this size without it.',
    rating: 5,
    stat: '80-person scale',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <i
        key={i}
        className={`text-sm ${i < rating ? 'ri-star-fill text-[#1c2b3a]' : 'ri-star-line text-[#c8d8e8]'}`}
      />
    ))}
  </div>
);

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const headerRef = useScrollAnimation<HTMLDivElement>();
  const bodyRef = useScrollAnimation<HTMLDivElement>({ rootMargin: '0px 0px -60px 0px' });
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = (idx: number) => {
    if (animating || idx === activeIndex) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex(idx);
      setAnimating(false);
    }, 300);
  };

  const resetAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
  };

  useEffect(() => {
    resetAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  const active = testimonials[activeIndex];
  const visibleCards = [
    testimonials[(activeIndex - 1 + testimonials.length) % testimonials.length],
    active,
    testimonials[(activeIndex + 1) % testimonials.length],
  ];

  return (
    <section className="w-full bg-[#eaf0f6] py-20 md:py-32 px-6 md:px-12 relative overflow-hidden">
      {/* subtle grid bg */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(#c8d8e8 1px, transparent 1px), linear-gradient(90deg, #c8d8e8 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_70%_50%_at_50%_50%,transparent_30%,#eaf0f6_100%)]" />

      <div className="relative w-full">
        {/* Header */}
        <div ref={headerRef} className="fade-up mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#1c2b3a]" />
            <span className="text-xs font-mono font-semibold tracking-[0.2em] text-[#5a7a96] uppercase">
              Testimonials
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-4xl md:text-6xl font-black text-[#1c2b3a] leading-[1.05]">
              Real Teams.<br />Real Results.
            </h2>
            <div className="flex items-center gap-6 lg:pb-2">
              <div className="text-right">
                <div className="text-3xl font-black font-mono text-[#1c2b3a]">50K+</div>
                <div className="text-xs text-[#8aafc8]">Teams worldwide</div>
              </div>
              <div className="w-px h-10 bg-[#c8d8e8]" />
              <div className="text-right">
                <div className="text-3xl font-black font-mono text-[#1c2b3a]">4.9★</div>
                <div className="text-xs text-[#8aafc8]">Average rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div ref={bodyRef} className="fade-up">
          {/* Cards row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {visibleCards.map((t, pos) => {
              const isCenter = pos === 1;
              return (
                <div
                  key={`${t.name}-${pos}`}
                  onClick={() => {
                    if (pos === 0) { goTo((activeIndex - 1 + testimonials.length) % testimonials.length); resetAuto(); }
                    if (pos === 2) { goTo((activeIndex + 1) % testimonials.length); resetAuto(); }
                  }}
                  className={`relative rounded-2xl border p-6 flex flex-col gap-5 transition-all duration-500 ${
                    isCenter
                      ? 'bg-[#1c2b3a] border-[#1c2b3a] scale-[1.02] cursor-default'
                      : 'bg-white/50 border-[#c8d8e8] opacity-60 hover:opacity-80 cursor-pointer scale-[0.97]'
                  } ${animating ? 'opacity-0 scale-95' : ''}`}
                  style={{ transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)' }}
                >
                  {/* dot pattern on active */}
                  {isCenter && (
                    <div
                      className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
                      style={{
                        backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                        backgroundSize: '20px 20px',
                      }}
                    />
                  )}

                  {/* Quote mark */}
                  <div className={`text-5xl font-black leading-none select-none ${isCenter ? 'text-white/20' : 'text-[#c8d8e8]'}`}>
                    &ldquo;
                  </div>

                  {/* Quote text */}
                  <blockquote className={`text-sm leading-relaxed flex-1 ${isCenter ? 'text-white/80' : 'text-[#5a7a96]'}`}>
                    {t.quote}
                  </blockquote>

                  {/* Stat badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold w-fit ${
                    isCenter ? 'bg-white/15 text-white' : 'bg-[#eaf0f6] text-[#5a7a96]'
                  }`}>
                    <i className="ri-bar-chart-2-line text-xs" />
                    {t.stat}
                  </div>

                  {/* Divider */}
                  <div className={`w-full h-px ${isCenter ? 'bg-white/15' : 'bg-[#c8d8e8]'}`} />

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold truncate ${isCenter ? 'text-white' : 'text-[#1c2b3a]'}`}>
                        {t.name}
                      </div>
                      <div className={`text-xs truncate ${isCenter ? 'text-white/50' : 'text-[#8aafc8]'}`}>
                        {t.role} · {t.company}
                      </div>
                    </div>
                    <StarRating rating={t.rating} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { goTo(i); resetAuto(); }}
                  className={`rounded-full transition-all duration-500 cursor-pointer ${
                    activeIndex === i
                      ? 'w-8 h-2 bg-[#1c2b3a]'
                      : 'w-2 h-2 bg-[#c8d8e8] hover:bg-[#8aafc8]'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => { goTo((activeIndex - 1 + testimonials.length) % testimonials.length); resetAuto(); }}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[#c8d8e8] bg-white/60 text-[#1c2b3a] hover:bg-[#1c2b3a] hover:text-white hover:border-[#1c2b3a] transition-all duration-300 cursor-pointer"
              >
                <i className="ri-arrow-left-line text-sm" />
              </button>
              <button
                type="button"
                onClick={() => { goTo((activeIndex + 1) % testimonials.length); resetAuto(); }}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-[#c8d8e8] bg-white/60 text-[#1c2b3a] hover:bg-[#1c2b3a] hover:text-white hover:border-[#1c2b3a] transition-all duration-300 cursor-pointer"
              >
                <i className="ri-arrow-right-line text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

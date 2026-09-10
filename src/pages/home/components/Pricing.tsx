import { useState, useRef, useEffect } from 'react';

const allFeatures = [
  'Projects',
  'Team members',
  'File storage',
  'Task management',
  'Mobile app',
  'Advanced analytics',
  'Automation rules',
  'Priority support',
  'Custom integrations & API',
  'SSO & SAML',
  'Dedicated manager',
  'SLA guarantee',
];

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'For individuals and small teams just getting started.',
    highlight: false,
    badge: null,
    cta: 'Get Started Free',
    features: {
      'Projects': 'Up to 5',
      'Team members': 'Up to 3',
      'File storage': '1 GB',
      'Task management': true,
      'Mobile app': true,
      'Advanced analytics': false,
      'Automation rules': false,
      'Priority support': false,
      'Custom integrations & API': false,
      'SSO & SAML': false,
      'Dedicated manager': false,
      'SLA guarantee': false,
    },
  },
  {
    name: 'Pro',
    price: { monthly: 18, annual: 14 },
    description: 'For growing teams that need more power and collaboration.',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Free Trial',
    features: {
      'Projects': 'Unlimited',
      'Team members': 'Up to 25',
      'File storage': '50 GB',
      'Task management': true,
      'Mobile app': true,
      'Advanced analytics': true,
      'Automation rules': true,
      'Priority support': true,
      'Custom integrations & API': false,
      'SSO & SAML': false,
      'Dedicated manager': false,
      'SLA guarantee': false,
    },
  },
  {
    name: 'Enterprise',
    price: { monthly: null, annual: null },
    description: 'For large organizations with custom needs and compliance.',
    highlight: false,
    badge: null,
    cta: 'Contact Sales',
    features: {
      'Projects': 'Unlimited',
      'Team members': 'Unlimited',
      'File storage': 'Unlimited',
      'Task management': true,
      'Mobile app': true,
      'Advanced analytics': true,
      'Automation rules': true,
      'Priority support': true,
      'Custom integrations & API': true,
      'SSO & SAML': true,
      'Dedicated manager': true,
      'SLA guarantee': '99.9%',
    },
  },
];

const FeatureValue = ({ val, highlight }: { val: boolean | string; highlight: boolean }) => {
  if (val === false) {
    return (
      <div className="w-5 h-5 flex items-center justify-center mx-auto">
        <div className={`w-1.5 h-1.5 rounded-full ${highlight ? 'bg-white/20' : 'bg-[#c8d8e8]'}`} />
      </div>
    );
  }
  if (val === true) {
    return (
      <div className={`w-5 h-5 flex items-center justify-center rounded-full mx-auto ${
        highlight ? 'bg-white/20 text-white' : 'bg-[#1c2b3a]/10 text-[#1c2b3a]'
      }`}>
        <i className="ri-check-line text-xs" />
      </div>
    );
  }
  return (
    <span className={`text-xs font-semibold font-mono ${highlight ? 'text-white/80' : 'text-[#1c2b3a]'}`}>
      {val}
    </span>
  );
};

const Pricing = () => {
  const [annual, setAnnual] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="w-full bg-white pt-20 md:pt-28 pb-12 md:pb-16 px-6 md:px-12 relative overflow-hidden"
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage:
            'linear-gradient(#c8d8e8 1px, transparent 1px), linear-gradient(90deg, #c8d8e8 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,#eaf0f6_0%,transparent_60%)]" />

      <div className="relative w-full">
        {/* Header */}
        <div
          className={`mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-[#1c2b3a]" />
            <span className="text-xs font-mono font-semibold tracking-[0.2em] text-[#5a7a96] uppercase">
              Pricing
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h2 className="text-4xl md:text-6xl font-black text-[#1c2b3a] leading-[1.05] mb-4">
                Simple,<br />Transparent Pricing
              </h2>
            </div>

            {/* Toggle */}
            <div className="flex flex-col items-start lg:items-end gap-3 lg:pb-2">
              <div className="inline-flex items-center bg-[#eaf0f6] rounded-full px-1 py-1">
                <button
                  type="button"
                  onClick={() => setAnnual(false)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    !annual ? 'bg-[#1c2b3a] text-white' : 'text-[#5a7a96] hover:text-[#1c2b3a]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setAnnual(true)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    annual ? 'bg-[#1c2b3a] text-white' : 'text-[#5a7a96] hover:text-[#1c2b3a]'
                  }`}
                >
                  Annual
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${annual ? 'bg-white/20 text-white' : 'bg-[#1c2b3a]/10 text-[#1c2b3a]'}`}>
                    Save 22%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {plans.map((plan, idx) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl flex flex-col transition-all duration-700 overflow-hidden ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${
                plan.highlight
                  ? 'bg-[#1c2b3a] ring-2 ring-[#1c2b3a]'
                  : 'bg-[#eaf0f6] border border-[#c8d8e8] hover:border-[#8aafc8]'
              }`}
              style={{ transitionDelay: `${idx * 120 + 200}ms` }}
            >
              {/* dot pattern on highlight */}
              {plan.highlight && (
                <div
                  className="absolute inset-0 opacity-[0.07] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }}
                />
              )}

              {/* Badge */}
              {plan.badge && (
                <div className="relative flex justify-center pt-5">
                  <span className="bg-[#f0a500] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className={`relative p-7 flex flex-col flex-1 ${plan.badge ? 'pt-4' : ''}`}>
                {/* Plan name + desc */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-bold tracking-widest uppercase ${plan.highlight ? 'text-white/40' : 'text-[#8aafc8]'}`}>
                      {plan.name}
                    </p>
                    {plan.highlight && (
                      <span className="text-[10px] font-mono text-white/40 border border-white/20 px-2 py-0.5 rounded-full">
                        RECOMMENDED
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1 mb-3">
                    {plan.price.monthly === null ? (
                      <span className={`font-black text-4xl ${plan.highlight ? 'text-white' : 'text-[#1c2b3a]'}`}>Custom</span>
                    ) : plan.price.monthly === 0 ? (
                      <span className={`font-black text-4xl ${plan.highlight ? 'text-white' : 'text-[#1c2b3a]'}`}>Free</span>
                    ) : (
                      <>
                        <span className={`text-lg font-semibold mt-1 ${plan.highlight ? 'text-white/50' : 'text-[#8aafc8]'}`}>$</span>
                        <span className={`font-black text-4xl leading-none font-mono ${plan.highlight ? 'text-white' : 'text-[#1c2b3a]'}`}>
                          {annual ? plan.price.annual : plan.price.monthly}
                        </span>
                        <span className={`text-sm mb-1 ${plan.highlight ? 'text-white/40' : 'text-[#8aafc8]'}`}>/mo</span>
                      </>
                    )}
                  </div>

                  <p className={`text-sm leading-relaxed ${plan.highlight ? 'text-white/60' : 'text-[#5a7a96]'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer whitespace-nowrap mb-7 ${
                    plan.highlight
                      ? 'bg-white text-[#1c2b3a] hover:bg-[#eaf0f6]'
                      : 'bg-[#1c2b3a] text-white hover:bg-[#2d3f52]'
                  }`}
                >
                  {plan.cta}
                </button>

                {/* Divider */}
                <div className={`w-full h-px mb-6 ${plan.highlight ? 'bg-white/15' : 'bg-[#c8d8e8]'}`} />

                {/* Key features list */}
                <ul className="flex flex-col gap-3 flex-1">
                  {allFeatures.slice(0, 7).map((feat) => {
                    const val = plan.features[feat as keyof typeof plan.features];
                    if (val === false) return null;
                    return (
                      <li key={feat} className="flex items-center gap-3">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 ${
                          plan.highlight ? 'bg-white/20 text-white' : 'bg-[#1c2b3a]/10 text-[#1c2b3a]'
                        }`}>
                          <i className="ri-check-line text-xs" />
                        </div>
                        <span className={`text-sm ${plan.highlight ? 'text-white/80' : 'text-[#3a5060]'}`}>
                          {typeof val === 'string' ? `${val} ${feat.toLowerCase()}` : feat}
                        </span>
                      </li>
                    );
                  })}
                  {plan.name === 'Enterprise' && (
                    <li className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 bg-[#1c2b3a]/10 text-[#1c2b3a]">
                        <i className="ri-check-line text-xs" />
                      </div>
                      <span className="text-sm text-[#3a5060]">Everything in Pro, plus more</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Compare toggle */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-[#5a7a96] hover:text-[#1c2b3a] transition-colors cursor-pointer"
          >
            <i className={`text-base transition-transform duration-300 ${showTable ? 'ri-subtract-line' : 'ri-add-line'}`} />
            {showTable ? 'Hide' : 'Compare'} full feature list
          </button>
        </div>

        {/* Comparison table */}
        <div
          className={`overflow-hidden transition-all duration-500 ${showTable ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="rounded-2xl border border-[#c8d8e8] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-4 bg-[#1c2b3a]">
              <div className="p-4 text-xs font-mono font-semibold text-white/40 uppercase tracking-widest">Feature</div>
              {plans.map((p) => (
                <div key={p.name} className="p-4 text-center">
                  <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-1">{p.name}</div>
                  {p.price.monthly !== null && p.price.monthly !== 0 && (
                    <div className="text-white font-black font-mono text-lg">
                      ${annual ? p.price.annual : p.price.monthly}
                      <span className="text-white/40 text-xs font-normal">/mo</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Table rows */}
            {allFeatures.map((feat, i) => (
              <div
                key={feat}
                className={`grid grid-cols-4 border-t border-[#c8d8e8] ${i % 2 === 0 ? 'bg-white' : 'bg-[#f5f9fc]'}`}
              >
                <div className="p-4 text-sm text-[#3a5060] font-medium">{feat}</div>
                {plans.map((p) => (
                  <div key={p.name} className={`p-4 flex items-center justify-center ${p.highlight ? 'bg-[#1c2b3a]/5' : ''}`}>
                    <FeatureValue val={p.features[feat as keyof typeof p.features]} highlight={false} />
                  </div>
                ))}
              </div>
            ))}

            {/* Table footer CTA */}
            <div className="grid grid-cols-4 border-t border-[#c8d8e8] bg-[#eaf0f6]">
              <div className="p-5" />
              {plans.map((p) => (
                <div key={p.name} className="p-4 flex justify-center">
                  <button
                    type="button"
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      p.highlight
                        ? 'bg-[#1c2b3a] text-white hover:bg-[#2d3f52]'
                        : 'bg-white border border-[#c8d8e8] text-[#1c2b3a] hover:border-[#1c2b3a]'
                    }`}
                  >
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;

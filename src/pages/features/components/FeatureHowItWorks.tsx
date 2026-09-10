import { memo } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const steps = [
  {
    num: '01',
    badge: '5-MIN SETUP',
    title: 'Create Your Workspace',
    desc: 'Set up projects, invite your team, and import existing tasks in minutes. No IT required.',
    img: 'https://readdy.ai/api/search-image?query=business-professionals-gathered-around-laptop-setting-up-project-workspace-modern-meeting-room-clean-white-interior-team-onboarding-session-blue-gray-palette-professional-corporate-photography-natural-light&width=600&height=380&seq=features-step1-collab-2026&orientation=landscape',
    imgAlt: 'Business team gathered around laptop setting up a project workspace',
  },
  {
    num: '02',
    badge: 'VISUAL BOARDS',
    title: 'Plan & Assign Work',
    desc: 'Build roadmaps, break work into sprints, and assign owners with clear deadlines.',
    img: 'https://readdy.ai/api/search-image?query=diverse-business-team-collaborating-on-whiteboard-planning-project-sprints-assigning-tasks-with-sticky-notes-modern-creative-office-space-natural-daylight-professional-corporate-photography-blue-accent-colors&width=600&height=380&seq=features-step2-collab-2026&orientation=landscape',
    imgAlt: 'Diverse team collaborating on a whiteboard planning sprints and assigning tasks',
  },
  {
    num: '03',
    badge: 'REAL-TIME INSIGHTS',
    title: 'Track & Ship Results',
    desc: 'Monitor velocity, surface blockers early, and hit every deadline with confidence.',
    img: 'https://readdy.ai/api/search-image?query=professional-team-reviewing-project-results-on-large-digital-dashboard-analytics-charts-and-progress-indicators-modern-conference-room-bright-natural-light-corporate-photography-blue-gray-minimal-interior&width=600&height=380&seq=features-step3-collab-2026&orientation=landscape',
    imgAlt: 'Team reviewing project results on a large digital analytics dashboard',
  },
];

const FeatureHowItWorks = memo(() => {
  const headerRef = useScrollAnimation<HTMLDivElement>();
  const gridRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="w-full bg-[#eaf0f6] py-14 md:py-20 px-6 md:px-12">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div ref={headerRef} className="fade-up mb-10 md:mb-14">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-px bg-[#8896a4]" />
            <span className="text-xs font-medium tracking-[0.18em] text-[#8896a4] uppercase">
              Getting Started
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <h2 className="text-[clamp(1.75rem,3.5vw,3rem)] font-extrabold text-[#1c2b3a] leading-[1.15] tracking-tight max-w-xl">
              From First Task to Final Delivery in Three Steps
            </h2>
          </div>
        </div>

        {/* Steps with images */}
        <div ref={gridRef} className="fade-up grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center">
              {/* Image card with step badge */}
              <div className="relative mb-6 w-full">
                <div className="w-full rounded-xl overflow-hidden border border-[#e4eaf1] bg-white shadow-sm aspect-[16/10]">
                  <img
                    src={step.img}
                    alt={step.imgAlt}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    width="600"
                    height="380"
                  />
                </div>
                {/* Overlapping step badge */}
                <div className="absolute -top-2.5 -right-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#1c2b3a] flex items-center justify-center border-2 border-[#eaf0f6]">
                    <span className="text-[10px] font-bold text-white">{step.num}</span>
                  </div>
                </div>
              </div>

              {/* Pill badge */}
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#6b7b8d] px-3 py-0.5 rounded-full border border-[#d1d9e2] bg-white mb-3">
                {step.badge}
              </span>

              {/* Title */}
              <h3 className="text-base font-bold text-[#1c2b3a] mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#8896a4] leading-relaxed max-w-xs">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default FeatureHowItWorks;

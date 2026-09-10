import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const services = [
  {
    number: 'Service 01',
    title: 'Intelligent Task Automation',
    description:
      'Stop wasting time on repetitive work. TASKS. automatically routes assignments, sends deadline reminders, and escalates blockers — so your team stays focused on what actually moves the needle.',
    image: 'https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20headshot%20smiling%2C%20clean%20light%20background%2C%20business%20casual%2C%20confident%2C%20soft%20studio%20lighting&width=120&height=120&seq=svc-avatar-01&orientation=squarish',
  },
  {
    number: 'Service 02',
    title: 'Real-Time Team Collaboration',
    description:
      'Comments, mentions, file attachments, and live status updates — all threaded directly to the task. No more hunting through email chains or Slack threads to find context.',
    image: 'https://readdy.ai/api/search-image?query=professional%20man%20portrait%20headshot%20smiling%2C%20clean%20light%20background%2C%20business%20casual%2C%20confident%2C%20soft%20studio%20lighting&width=120&height=120&seq=svc-avatar-02&orientation=squarish',
  },
  {
    number: 'Service 03',
    title: 'Advanced Analytics & Reporting',
    description:
      'Understand exactly where time goes. Velocity charts, burndown reports, and custom KPI dashboards give managers the visibility they need to make faster, smarter decisions.',
    image: 'https://readdy.ai/api/search-image?query=professional%20asian%20woman%20portrait%20headshot%20smiling%2C%20clean%20light%20background%2C%20business%20casual%2C%20confident%2C%20soft%20studio%20lighting&width=120&height=120&seq=svc-avatar-03&orientation=squarish',
  },
];

const ServiceRow = ({ service, idx }: { service: typeof services[0]; idx: number }) => {
  const rowRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const delays = ['', 'delay-100', 'delay-200'];
  return (
    <div
      ref={rowRef}
      className={`flex flex-col md:flex-row items-start md:items-center gap-6 py-10 group cursor-pointer fade-up ${delays[idx] || ''}`}
    >
      {/* Number */}
      <span className="text-xs text-gray-400 font-semibold tracking-widest w-24 flex-shrink-0">
        {service.number}
      </span>

      {/* Title + desc */}
      <div className="flex-1">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#1c2b3a] transition-colors">
          {service.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{service.description}</p>
      </div>

      {/* Portrait */}
      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
        <img src={service.image} alt={service.title} className="w-full h-full object-cover object-top" />
      </div>

      {/* Arrow */}
      <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
        <i className="ri-arrow-right-line text-gray-400 group-hover:text-gray-900 transition-colors text-lg"></i>
      </div>
    </div>
  );
};

const Services = () => {
  const headerRef = useScrollAnimation<HTMLDivElement>();
  const ctaRef = useScrollAnimation<HTMLDivElement>();
  const goToContact = () => {
    if (typeof window !== 'undefined' && window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE('/contact');
    }
  };

  return (
    <section id="plans" className="w-full bg-white py-20 md:py-28 px-8 md:px-12">
      <div className="w-full">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6 fade-up">
          <div>
            <div className="w-12 h-px bg-gray-900 mb-6"></div>
            <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">
              Everything Your Team Needs to Ship Faster
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">What We Offer</h2>
          </div>
          <div className="w-12 h-px bg-gray-200 hidden lg:block"></div>
        </div>

        {/* Services list */}
        <div className="flex flex-col divide-y divide-gray-200">
          {services.map((service, idx) => (
            <ServiceRow key={idx} service={service} idx={idx} />
          ))}
        </div>

        {/* Book a Demo CTA */}
        <div ref={ctaRef} className="mt-16 flex flex-col md:flex-row items-start md:items-center gap-8 fade-up">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full overflow-hidden">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20woman%20portrait%20headshot%20smiling%2C%20clean%20light%20background%2C%20business%20casual%2C%20confident%2C%20soft%20studio%20lighting&width=80&height=80&seq=cta-avatar-01&orientation=squarish"
                alt="Team"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden -ml-3">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20man%20portrait%20headshot%20smiling%2C%20clean%20light%20background%2C%20business%20casual%2C%20confident%2C%20soft%20studio%20lighting&width=80&height=80&seq=cta-avatar-02&orientation=squarish"
                alt="Team"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden -ml-3">
              <img
                src="https://readdy.ai/api/search-image?query=professional%20asian%20man%20portrait%20headshot%20smiling%2C%20clean%20light%20background%2C%20business%20casual%2C%20confident%2C%20soft%20studio%20lighting&width=80&height=80&seq=cta-avatar-03&orientation=squarish"
                alt="Team"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
          <button
            onClick={goToContact}
            className="flex items-center gap-3 bg-[#1c2b3a] text-white px-8 py-4 font-bold text-sm hover:bg-gray-900 transition-colors cursor-pointer whitespace-nowrap group"
          >
            Book a Demo
            <span className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
              <i className="ri-arrow-right-up-line text-xs"></i>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;

import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const features = [
  {
    number: '01',
    title: 'Smart Task Prioritization',
    description:
      'AI-powered priority scoring surfaces the tasks that matter most. Stop guessing what to work on next — TASKS. analyzes deadlines, dependencies, and team capacity to keep everyone focused.',
  },
  {
    number: '02',
    title: 'Customizable Workflows',
    description:
      'Build workflows that match how your team actually works. Drag-and-drop stages, custom fields, and conditional automations adapt to any methodology — Scrum, Kanban, or your own hybrid.',
  },
  {
    number: '03',
    title: 'Seamless Integrations',
    description:
      'Connect with Slack, GitHub, Figma, Google Drive, and 50+ tools your team already uses. Tasks sync automatically so nothing falls through the cracks between platforms.',
  },
  {
    number: '04',
    title: 'Automated Progress Reports',
    description:
      'Weekly summaries, sprint retrospectives, and stakeholder updates — generated automatically. Spend less time writing status reports and more time shipping great work.',
  },
];

const FeatureItem = ({ f, idx }: { f: typeof features[0]; idx: number }) => {
  const itemRef = useScrollAnimation<HTMLDivElement>({ threshold: 0.1 });
  const delays = ['', 'delay-100', 'delay-200', 'delay-300'];
  return (
    <div
      ref={itemRef}
      className={`py-10 sm:px-8 flex flex-col gap-4 border-gray-200 fade-up ${delays[idx] || ''} ${
        idx % 2 === 0 ? 'sm:border-r' : ''
      } ${idx < 2 ? 'sm:border-b' : ''}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-gray-400 tracking-widest">{f.number}</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>
      <h3 className="text-lg md:text-xl font-bold text-gray-900">{f.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
    </div>
  );
};

const FeaturesGrid = () => {
  const leftRef = useScrollAnimation<HTMLDivElement>();

  return (
    <section className="w-full bg-white py-20 md:py-28 px-8 md:px-12">
      <div className="w-full flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Left: image + header */}
        <div ref={leftRef} className="lg:w-80 flex-shrink-0 flex flex-col gap-8 slide-left">
          <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden">
            <img
              src="https://readdy.ai/api/search-image?query=close%20up%20of%20hands%20typing%20on%20laptop%20with%20project%20management%20dashboard%20visible%20on%20screen%2C%20modern%20desk%20setup%2C%20blue%20gray%20ambient%20lighting%2C%20clean%20minimal%20workspace%2C%20productivity%20tools%2C%20professional%20tech%20environment&width=400&height=300&seq=features-grid-img-001&orientation=landscape"
              alt="TASKS. powerful features"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <div className="w-12 h-px bg-gray-900 mb-6"></div>
            <p className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-3">
              Built for Scale
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Engineered to Drive Results
            </h2>
          </div>
        </div>

        {/* Right: features grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0">
          {features.map((f, idx) => (
            <FeatureItem key={idx} f={f} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;

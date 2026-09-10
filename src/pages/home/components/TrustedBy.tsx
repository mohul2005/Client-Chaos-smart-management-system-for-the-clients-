import { useEffect, useRef } from 'react';

const logos = [
  { name: 'Notion', icon: 'ri-file-text-line' },
  { name: 'Slack', icon: 'ri-slack-line' },
  { name: 'GitHub', icon: 'ri-github-line' },
  { name: 'Figma', icon: 'ri-pen-nib-line' },
  { name: 'Google', icon: 'ri-google-line' },
  { name: 'Stripe', icon: 'ri-bank-card-line' },
  { name: 'Dropbox', icon: 'ri-dropbox-line' },
  { name: 'Zoom', icon: 'ri-video-chat-line' },
  { name: 'Atlassian', icon: 'ri-trello-line' },
  { name: 'HubSpot', icon: 'ri-customer-service-2-line' },
];

const TrustedBy = () => {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.4;
    let raf: number;

    const animate = () => {
      pos -= speed;
      const half = el.scrollWidth / 2;
      if (Math.abs(pos) >= half) pos = 0;
      el.style.transform = `translateX(${pos}px)`;
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const allLogos = [...logos, ...logos];

  return (
    <section className="w-full bg-white border-y border-gray-100 py-10 overflow-hidden">
      <div className="relative w-full overflow-hidden">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <div
          ref={trackRef}
          className="flex items-center gap-0"
          style={{ willChange: 'transform', width: 'max-content' }}
        >
          {allLogos.map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-10 py-2 border-r border-gray-100 last:border-r-0 group cursor-default"
            >
              <div className="w-8 h-8 flex items-center justify-center text-gray-400 group-hover:text-gray-700 transition-colors">
                <i className={`${logo.icon} text-xl`}></i>
              </div>
              <span className="text-sm font-semibold text-gray-400 group-hover:text-gray-700 transition-colors whitespace-nowrap tracking-wide">
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;

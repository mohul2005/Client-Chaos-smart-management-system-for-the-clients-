import { useEffect, useRef, useState, memo } from 'react';
import { Link } from 'react-router-dom';

/* ─── Constants ─────────────────────────────────────────── */
const BRAND = 'TASKS.';
const TYPE_SPEED = 110;
const DELETE_SPEED = 70;
const PAUSE_AFTER_TYPE = 1800;
const PAUSE_AFTER_DELETE = 500;

/* ─── Typewriter — isolated component so its setState never
       re-renders the parent (and thus never re-renders HeroImage) ── */
const Typewriter = memo(() => {
  const [displayed, setDisplayed] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const type = (i: number) => {
      setDisplayed(BRAND.slice(0, i));
      if (i < BRAND.length) {
        timeout = setTimeout(() => type(i + 1), TYPE_SPEED);
      } else {
        timeout = setTimeout(() => erase(BRAND.length), PAUSE_AFTER_TYPE);
      }
    };
    const erase = (i: number) => {
      setDisplayed(BRAND.slice(0, i));
      if (i > 0) {
        timeout = setTimeout(() => erase(i - 1), DELETE_SPEED);
      } else {
        timeout = setTimeout(() => type(1), PAUSE_AFTER_DELETE);
      }
    };
    timeout = setTimeout(() => type(1), 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <div
      className="w-full"
      style={{ height: 'clamp(72px, 12vw, 160px)' }}
    >
      <h1 className="font-black text-[clamp(72px,12vw,160px)] leading-none tracking-tight text-gray-900 uppercase flex items-end select-none h-full">
        <span>{displayed}</span>
        <span
          className="inline-block w-[0.08em] h-[0.85em] bg-gray-900 ml-1 mb-1"
          style={{ opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.08s' }}
        />
      </h1>
    </div>
  );
});

/* ─── Hero Video — optimized loading + parallax ──────── */
const HeroVideo = memo(() => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    const handleMove = (e: MouseEvent) => {
      const { left, top, width, height } = wrap.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 12;   // ±6px
      const y = ((e.clientY - top) / height - 0.5) * 8;    // ±4px
      video.style.transform = `translate(${x}px, ${y}px) scale(1.04)`;
    };

    const handleLeave = () => {
      video.style.transform = 'translate(0px, 0px) scale(1)';
    };

    wrap.addEventListener('mousemove', handleMove);
    wrap.addEventListener('mouseleave', handleLeave);
    return () => {
      wrap.removeEventListener('mousemove', handleMove);
      wrap.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div ref={wrapRef} className="w-full h-[420px] md:h-[600px] overflow-hidden relative group cursor-crosshair">
      {/* Skeleton loader shown until video is ready */}
      {!loaded && (
        <div className="absolute inset-0 bg-[#d8e4ef] animate-pulse z-10" />
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-cover object-center"
        style={{ transition: 'transform 0.25s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease', willChange: 'transform', opacity: loaded ? 1 : 0 }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={() => setLoaded(true)}
      >
        <source
          src="https://storage.readdy-site.link/project_files/2a4f34f3-c765-4d1c-b710-956425564577/9befca9f-9636-48be-8781-9a06ef43bea3_3.mp4?v=271c8845568260c545afc93f6c4734a8"
          type="video/mp4"
        />
      </video>

      {/* Hover shimmer hint */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent" />
    </div>
  );
});

/* ─── Marquee ─────────────────────────────────────────────── */
const Marquee = memo(() => {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeText = 'Plan Smarter. Execute Faster. Deliver On Time.';

  useEffect(() => {
    const el = marqueeRef.current;
    if (!el) return;
    let pos = 0;
    const speed = 0.5;
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

  return (
    <div className="flex-1 bg-[#1c2b3a] overflow-hidden flex items-center h-16 md:h-20">
      <div ref={marqueeRef} className="flex whitespace-nowrap" style={{ willChange: 'transform' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="text-white font-semibold text-sm md:text-base px-6 flex items-center gap-4">
            {marqueeText}
            <span className="inline-block w-2 h-2 rounded-full bg-white/40 mx-2" />
          </span>
        ))}
      </div>
    </div>
  );
});

/* ─── Hero (parent — no state, never re-renders) ──────────── */
const Hero = () => {
  return (
    <section id="hero" className="pt-16 bg-[#eaf0f6]">
      {/* Big title */}
      <div className="w-full px-8 md:px-12 pt-10 pb-0">
        <Typewriter />
      </div>

      {/* Marquee + CTA row */}
      <div className="w-full flex flex-col md:flex-row">
        <Marquee />
        <Link
          to="/contact"
          className="bg-[#eaf0f6] border-t-2 md:border-t-0 md:border-l-2 border-gray-900 h-16 md:h-20 px-8 md:px-12 flex items-center justify-center gap-3 font-bold text-gray-900 text-base md:text-lg hover:bg-[#5b9ec9] hover:text-white hover:border-[#5b9ec9] transition-colors whitespace-nowrap group"
        >
          Book a Demo
          <span className="w-7 h-7 rounded-full border-2 border-gray-900 group-hover:border-white flex items-center justify-center transition-colors">
            <i className="ri-arrow-right-up-line text-sm" />
          </span>
        </Link>
      </div>

      {/* Hero video */}
      <div className="w-full">
        <HeroVideo />
      </div>
    </section>
  );
};

export default Hero;
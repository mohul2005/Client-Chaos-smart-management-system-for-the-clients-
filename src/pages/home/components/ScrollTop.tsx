import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollTop = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  /* 路由切换时自动回到顶部 */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(pct);
      setVisible(scrollTop > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      className={`fixed bottom-8 right-8 z-50 cursor-pointer transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {/* SVG progress ring */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        className="block"
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="#1c2b3a"
          stroke="#c8d8e8"
          strokeWidth="2"
        />
        {/* Progress arc */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.2s ease' }}
        />
      </svg>

      {/* Arrow icon centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="ri-arrow-up-line text-white text-base" />
      </div>
    </button>
  );
};

export default ScrollTop;

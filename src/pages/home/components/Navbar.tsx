import { useState, useEffect } from 'react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      setProgress(Math.min(pct, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setActiveId(id);
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white border-b border-gray-200' : 'bg-transparent'
      }`}
    >
      {/* Scroll progress bar */}
      <div className="absolute top-0 left-0 w-full h-[3px] z-10 overflow-hidden">
        <div
          className="h-full bg-[#1c2b3a] transition-all duration-75 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="w-full px-8 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 cursor-pointer">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-checkbox-multiple-line text-xl text-gray-900"></i>
          </div>
          <span className="font-black text-gray-900 text-sm tracking-widest uppercase">TASKS.</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {[
            { label: 'Home', id: 'hero' },
            { label: 'Features', id: 'features' },
            { label: 'Pricing', id: 'pricing' },
            { label: 'Contact', id: 'contact' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`relative text-sm font-medium transition-colors cursor-pointer whitespace-nowrap pb-1 ${
                activeId === item.id
                  ? 'font-bold text-[#1a4a7a]'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-[#1a4a7a] transition-all duration-300 ${
                  activeId === item.id ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer whitespace-nowrap">
            <i className="ri-user-line text-base"></i>
            Log In
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <i className={`text-xl text-gray-900 ${menuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-8 py-6 flex flex-col gap-5">
          {[
            { label: 'Home', id: 'hero' },
            { label: 'Features', id: 'features' },
            { label: 'Pricing', id: 'pricing' },
            { label: 'Contact', id: 'contact' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm text-gray-700 font-medium text-left cursor-pointer whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
          <button className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap">
            <i className="ri-user-line"></i> Log In
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  const isHome = location.pathname === '/';

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled || !isHome ? 'bg-white border-b border-gray-200' : 'bg-transparent'
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
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-6 h-6 flex items-center justify-center">
            <i className="ri-checkbox-multiple-line text-xl text-gray-900"></i>
          </div>
          <span className="font-black text-gray-900 text-sm tracking-widest uppercase">TASKS.</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative text-sm font-medium transition-colors cursor-pointer whitespace-nowrap pb-1 ${
                isActive(item.path)
                  ? 'font-bold text-[#1a4a7a]'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {item.label}
              <span
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full bg-[#1a4a7a] transition-all duration-300 ${
                  isActive(item.path) ? 'w-full opacity-100' : 'w-0 opacity-0'
                }`}
              />
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/request"
            className="flex items-center gap-2 text-sm font-semibold text-[#1c2b3a] hover:text-[#0e1a26] cursor-pointer whitespace-nowrap px-4 py-2 rounded-md border border-[#1c2b3a]/20 hover:bg-[#1c2b3a]/5 transition-colors"
          >
            <i className="ri-send-plane-line text-base"></i>
            Submit a request
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-line text-base"></i>
            Log In
          </Link>
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
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMenuOpen(false)}
              className={`text-sm font-medium text-left cursor-pointer whitespace-nowrap ${
                isActive(item.path) ? 'text-[#1a4a7a] font-bold' : 'text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/request"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-[#1c2b3a] cursor-pointer whitespace-nowrap"
          >
            <i className="ri-send-plane-line"></i> Submit a request
          </Link>
          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-line"></i> Log In
          </Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
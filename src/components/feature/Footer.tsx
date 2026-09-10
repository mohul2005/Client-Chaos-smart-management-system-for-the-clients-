import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0e1a26] py-16 md:py-20 px-8 md:px-12 relative overflow-hidden">
      {/* subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #4a7a9b 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3a6080]/60 to-transparent" />

      <div className="relative w-full">
        {/* Top row */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-0 justify-between mb-16">
          {/* Brand */}
          <div className="lg:w-64">
            <h2 className="font-black text-4xl md:text-5xl text-white mb-6">TASKS.</h2>
            <div className="w-12 h-px bg-white/20 mb-6" />
            <p className="text-sm text-white/50 leading-relaxed mb-6 max-w-xs">
              The task management platform built for teams that ship fast and think clearly.
            </p>
            <div className="flex items-center gap-3">
              {[
                { href: 'https://www.instagram.com', icon: 'ri-instagram-line' },
                { href: 'https://www.linkedin.com', icon: 'ri-linkedin-line' },
                { href: 'https://www.twitter.com', icon: 'ri-twitter-x-line' },
              ].map((s) => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                >
                  <i className={`${s.icon} text-base`} />
                </a>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div>
            <p className="text-xs font-bold tracking-widest text-white/30 uppercase mb-5">Menu</p>
            <nav className="flex flex-col gap-3">
              {[
                { label: 'Home', path: '/' },
                { label: 'Features', path: '/features' },
                { label: 'Pricing', path: '/pricing' },
                { label: 'Contact', path: '/contact' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm text-white/50 hover:text-white transition-colors text-left cursor-pointer whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold tracking-widest text-white/30 uppercase mb-5">Legal</p>
            <div className="flex flex-col gap-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map((p) => (
                <span
                  key={p}
                  className="text-sm text-white/50 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold tracking-widest text-white/30 uppercase mb-5">Contact</p>
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@tasks.io" className="text-sm text-white/50 hover:text-white transition-colors">
                hello@tasks.io
              </a>
              <p className="text-sm text-white/50">+1 (415) 800-2400</p>
              <p className="text-sm text-white/50">340 Pine Street, Suite 800</p>
              <p className="text-sm text-white/50">San Francisco, CA 94104</p>
            </div>
          </div>

          {/* Follow */}
          <div>
            <p className="text-xs font-bold tracking-widest text-white/30 uppercase mb-5">Follow Us</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Instagram', href: 'https://www.instagram.com' },
                { label: 'LinkedIn', href: 'https://www.linkedin.com' },
                { label: 'X (Twitter)', href: 'https://www.twitter.com' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer nofollow"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-xs text-white/25">
            © {currentYear} TASKS. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Built for teams that move fast.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
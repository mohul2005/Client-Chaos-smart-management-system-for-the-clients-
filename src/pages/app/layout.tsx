import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppSidebar from './components/AppSidebar';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/app/board': { title: 'Task Board', subtitle: 'Every client task, tracked from request to done.' },
  '/app/clients': { title: 'Clients', subtitle: 'The accounts your team is delivering for.' },
  '/app/team': { title: 'Team', subtitle: 'Who is on the ground and what they own.' },
};

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const meta = TITLES[location.pathname] || { title: 'Workspace', subtitle: '' };

  return (
    <div className="min-h-screen w-full bg-slate-50">
      <AppSidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-60 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center gap-4 px-4 md:px-8 sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden w-8 h-8 flex items-center justify-center cursor-pointer"
            aria-label="Open menu"
          >
            <i className="ri-menu-line text-xl text-slate-700"></i>
          </button>

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-base text-slate-900 truncate">{meta.title}</h2>
            <p className="hidden sm:block text-xs text-slate-400 truncate">{meta.subtitle}</p>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-emerald-700">Workspace live</span>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
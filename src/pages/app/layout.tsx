import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AVATAR_BG } from '@/lib/constants';
import { initials } from '@/lib/format';
import { runReminderSweep } from '@/lib/notifications';
import AppSidebar from './components/AppSidebar';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/app': { title: 'Overview', subtitle: 'A live pulse on workload, progress and risk.' },
  '/app/board': { title: 'Task Board', subtitle: 'Every client task, tracked from request to done.' },
  '/app/projects': { title: 'Projects', subtitle: 'Group related work and track progress against each engagement.' },
  '/app/requests': { title: 'Request Inbox', subtitle: 'Client requests moving through the pipeline — clarification to done.' },
  '/app/clients': { title: 'Clients', subtitle: 'The accounts your team is delivering for.' },
  '/app/team': { title: 'Team', subtitle: 'Who is on the ground and what they own.' },
  '/app/settings': { title: 'Settings', subtitle: 'Your personal notification preferences.' },
};

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();
  const avatarBg = AVATAR_BG[profile?.avatar_color || 'default'] || AVATAR_BG.default;

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Safety-net scheduler: the first person in each day kicks off the reminder
  // sweep (the backend de-duplicates, so this is safe alongside the cron job).
  useEffect(() => {
    runReminderSweep();
  }, []);

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

          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-medium text-emerald-700">Workspace live</span>
          </div>

          <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-slate-200">
            <div className="hidden sm:block text-right leading-tight min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate max-w-[180px]">
                {profile?.full_name || 'Teammate'}
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                {profile?.email || 'Signed in'}
              </p>
            </div>
            <div className={`w-9 h-9 rounded-full ${avatarBg} flex items-center justify-center text-xs font-bold shrink-0`}>
              {initials(profile?.full_name)}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 md:px-8 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
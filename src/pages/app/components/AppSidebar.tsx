import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AVATAR_BG } from '@/lib/constants';
import { initials } from '@/lib/format';

const navItems = [
  { label: 'Overview', path: '/app', icon: 'ri-dashboard-3-line', end: true },
  { label: 'Task Board', path: '/app/board', icon: 'ri-layout-column-line' },
  { label: 'Requests', path: '/app/requests', icon: 'ri-inbox-archive-line' },
  { label: 'Clients', path: '/app/clients', icon: 'ri-briefcase-4-line' },
  { label: 'Team', path: '/app/team', icon: 'ri-team-line' },
  { label: 'Settings', path: '/app/settings', icon: 'ri-settings-3-line' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AppSidebar({ open, onClose }: Props) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const color = AVATAR_BG[profile?.avatar_color || 'default'] || AVATAR_BG.default;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-60 bg-[#1c2b3a] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-checkbox-multiple-line text-xl"></i>
            </div>
            <div className="leading-none">
              <p className="font-black text-sm tracking-widest uppercase">TASKS.</p>
              <p className="text-[10px] text-white/40 mt-1">Lala Ops Workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center cursor-pointer"
            aria-label="Close menu"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.18em] uppercase text-white/30">Workspace</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <i className={`${item.icon} text-lg`}></i>
              </div>
              {item.label}
            </NavLink>
          ))}

          <div className="mt-6 px-3 py-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-[11px] text-white/50 leading-relaxed">
              <i className="ri-information-line mr-1"></i>
              Client requests land in Requests — convert one to a task in a click.
            </p>
          </div>
        </nav>

        {/* User */}
        <div className="p-3 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-xs font-bold shrink-0`}>
              {initials(profile?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">{profile?.full_name || 'Teammate'}</p>
              <p className="text-[11px] text-white/40 truncate">{profile?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-1 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <i className="ri-logout-box-r-line text-lg"></i>
            </div>
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
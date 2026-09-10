import { useMemo } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import { AVATAR_BG, ROLE_META } from '@/lib/constants';
import { formatDateTime, initials } from '@/lib/format';

export default function TeamPage() {
  const { members, tasks, loading, error, reload } = useWorkspace();

  const workload = useMemo(() => {
    const open = new Map<string, number>();
    const overdue = new Map<string, number>();
    tasks.forEach((t) => {
      if (!t.assignee_id || t.status === 'done') return;
      open.set(t.assignee_id, (open.get(t.assignee_id) || 0) + 1);
      if (t.due_date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(`${t.due_date}T00:00:00`) < today) {
          overdue.set(t.assignee_id, (overdue.get(t.assignee_id) || 0) + 1);
        }
      }
    });
    return { open, overdue };
  }, [tasks]);

  const maxOpen = useMemo(
    () => Math.max(1, ...members.map((m) => workload.open.get(m.id) || 0)),
    [members, workload],
  );

  return (
    <div className="w-full">
      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-team-line text-2xl text-slate-400"></i>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">Just you so far</h3>
          <p className="text-sm text-slate-500">
            When teammates create accounts they will show up here with their live workload.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => {
            const open = workload.open.get(m.id) || 0;
            const overdue = workload.overdue.get(m.id) || 0;
            const color = AVATAR_BG[m.avatar_color || 'default'] || AVATAR_BG.default;
            const role = ROLE_META[m.role] || ROLE_META.member;
            return (
              <article key={m.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full ${color} flex items-center justify-center text-sm font-bold text-white shrink-0`}>
                    {initials(m.full_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{m.full_name || 'Teammate'}</h3>
                    <p className="text-xs text-slate-400 truncate">{m.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${role.chip}`}>
                    {role.label}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-slate-400">Open workload</span>
                      <span className="text-[11px] font-bold text-slate-700">{open} tasks</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1c2b3a] transition-all duration-500"
                        style={{ width: `${(open / maxOpen) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                    <i className="ri-calendar-line"></i> Joined {formatDateTime(m.created_at)}
                  </span>
                  {overdue > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-[11px] font-semibold text-red-600">
                      <i className="ri-alarm-warning-line"></i> {overdue} overdue
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                      <i className="ri-checkbox-circle-line"></i> On track
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
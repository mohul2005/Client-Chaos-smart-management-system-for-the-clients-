import type { Profile } from '@/lib/types';
import { AVATAR_BG } from '@/lib/constants';
import { initials } from '@/lib/format';

export interface WorkloadRow {
  member: Profile;
  open: number;
  overdue: number;
  done: number;
}

interface Props {
  rows: WorkloadRow[];
  maxOpen: number;
}

export default function WorkloadPanel({ rows, maxOpen }: Props) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <i className="ri-team-line text-slate-600"></i>
          </div>
          <h3 className="font-bold text-sm text-slate-900">Workload by owner</h3>
        </div>
        <span className="hidden sm:block text-[11px] text-slate-400">Open tasks per teammate</span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-slate-500 py-6 text-center">No teammates yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map(({ member, open, overdue, done }) => {
            const color = AVATAR_BG[member.avatar_color || 'default'] || AVATAR_BG.default;
            return (
              <div key={member.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}>
                  {initials(member.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-xs font-semibold text-slate-700 truncate">
                      {member.full_name || member.email}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      {overdue > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
                          <i className="ri-alarm-warning-line"></i> {overdue}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-slate-700">{open} open</span>
                      <span className="hidden sm:inline text-[11px] text-slate-400">{done} done</span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-[#1c2b3a]"
                      style={{ width: `${maxOpen > 0 ? (open / maxOpen) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
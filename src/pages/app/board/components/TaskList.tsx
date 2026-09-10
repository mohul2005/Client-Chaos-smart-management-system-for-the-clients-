import type { TaskView } from '@/lib/types';
import { AVATAR_BG, PRIORITY_META, PROJECT_SOFT_BG, STATUS_META } from '@/lib/constants';
import { dueMeta, initials, relativeTime } from '@/lib/format';

interface Props {
  tasks: TaskView[];
  onOpen: (task: TaskView) => void;
}

const toneClass: Record<string, string> = {
  muted: 'text-slate-400',
  warn: 'text-amber-600',
  danger: 'text-red-600',
  done: 'text-emerald-600',
};

function DueCell({ task }: { task: TaskView }) {
  const due = dueMeta(task.due_date);
  const waiting = task.status === 'waiting_on_client';
  const tone = task.status === 'done' ? 'done' : waiting ? 'muted' : due.tone;
  const label = task.status === 'done' ? 'Completed' : waiting ? 'Waiting on client' : due.label;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${toneClass[tone]}`}>
      {task.status !== 'done' && !waiting && due.tone === 'danger' && (
        <i className="ri-alarm-warning-line text-sm"></i>
      )}
      {waiting && <i className="ri-shield-check-line text-sm"></i>}
      <span className="truncate">{label}</span>
    </span>
  );
}

export default function TaskList({ tasks, onOpen }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header (desktop) */}
      <div className="hidden lg:grid grid-cols-[112px_84px_minmax(0,1fr)_160px_140px_110px] gap-3 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        <span>Status</span>
        <span>Priority</span>
        <span>Task</span>
        <span>Owner</span>
        <span>Due</span>
        <span>Updated</span>
      </div>

      <div className="divide-y divide-slate-100">
        {tasks.map((task) => {
          const status = STATUS_META[task.status];
          const priority = PRIORITY_META[task.priority];
          const avatarColor = AVATAR_BG[task.assigneeColor || 'default'] || AVATAR_BG.default;
          const projectTint = PROJECT_SOFT_BG[task.projectColor || 'default'] || PROJECT_SOFT_BG.default;
          return (
            <article
              key={task.id}
              onClick={() => onOpen(task)}
              className="px-4 py-3.5 cursor-pointer hover:bg-slate-50/80 transition-colors flex flex-col gap-2.5 lg:grid lg:grid-cols-[112px_84px_minmax(0,1fr)_160px_140px_110px] lg:gap-3 lg:items-center"
            >
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border ${status.chip} whitespace-nowrap`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                  {status.label}
                </span>
                <span className="lg:hidden">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${priority.chip}`}>
                    {priority.label}
                  </span>
                </span>
              </div>

              <div className="hidden lg:block">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${priority.chip}`}>
                  {priority.label}
                </span>
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-slate-800 leading-snug truncate">{task.title}</h4>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {task.projectName && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${projectTint}`}>
                      <i className="ri-folders-line text-xs"></i>
                      <span className="truncate max-w-[160px]">{task.projectName}</span>
                    </span>
                  )}
                  {task.clientName && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <i className="ri-briefcase-4-line text-xs"></i>
                      <span className="truncate max-w-[140px]">{task.clientName}</span>
                    </span>
                  )}
                  {task.commentCount > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] text-slate-400">
                      <i className="ri-chat-3-line text-xs"></i>
                      {task.commentCount}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 min-w-0">
                {task.assigneeName ? (
                  <>
                    <div className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                      {initials(task.assigneeName)}
                    </div>
                    <span className="text-xs text-slate-600 truncate">{task.assigneeName}</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center shrink-0">
                      <i className="ri-user-add-line text-[11px] text-slate-400"></i>
                    </div>
                    <span className="text-xs text-slate-400">Unassigned</span>
                  </>
                )}
              </div>

              <div className="min-w-0">
                <DueCell task={task} />
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <i className="ri-history-line text-sm"></i>
                <span>{relativeTime(task.updated_at)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
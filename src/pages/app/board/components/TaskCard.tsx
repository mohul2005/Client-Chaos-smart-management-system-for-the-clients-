import type { TaskView } from '@/lib/types';
import { AVATAR_BG, PRIORITY_META, STATUS_META, STATUS_ORDER } from '@/lib/constants';
import { dueMeta, initials } from '@/lib/format';

interface Props {
  task: TaskView;
  onOpen: (task: TaskView) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onMove: (task: TaskView, direction: -1 | 1) => void;
  dragging: boolean;
}

const toneClass: Record<string, string> = {
  muted: 'text-slate-400',
  warn: 'text-amber-600',
  danger: 'text-red-600',
  done: 'text-emerald-600',
};

export default function TaskCard({ task, onOpen, onDragStart, onDragEnd, onMove, dragging }: Props) {
  const priority = PRIORITY_META[task.priority];
  const due = dueMeta(task.due_date);
  const statusIndex = STATUS_ORDER.indexOf(task.status);
  const avatarColor = AVATAR_BG[task.assigneeColor || 'default'] || AVATAR_BG.default;

  return (
    <article
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(task.id);
      }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task)}
      className={`group bg-white rounded-lg border border-slate-200 p-3.5 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:-translate-y-0.5 ${
        dragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${priority.chip}`}>
          {priority.label}
        </span>
        {task.clientName && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 truncate">
            <i className="ri-briefcase-4-line text-xs"></i>
            <span className="truncate">{task.clientName}</span>
          </span>
        )}
      </div>

      <h4 className="text-sm font-semibold text-slate-800 leading-snug mb-3 group-hover:text-[#1c2b3a]">
        {task.title}
      </h4>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {task.assigneeName ? (
            <div className={`w-6 h-6 rounded-full ${avatarColor} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
              {initials(task.assigneeName)}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center shrink-0">
              <i className="ri-user-add-line text-[11px] text-slate-400"></i>
            </div>
          )}
          <span className={`text-[11px] font-medium truncate ${toneClass[due.tone]}`}>
            {task.status === 'done' ? 'Completed' : due.label}
          </span>
          {task.commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-400 shrink-0">
              <i className="ri-chat-3-line text-xs"></i>
              {task.commentCount}
            </span>
          )}
        </div>

        {/* Quick move */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            aria-label="Move left"
            disabled={statusIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMove(task, -1);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <i className="ri-arrow-left-line text-sm"></i>
          </button>
          <button
            type="button"
            aria-label="Move right"
            disabled={statusIndex === STATUS_ORDER.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMove(task, 1);
            }}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <i className="ri-arrow-right-line text-sm"></i>
          </button>
        </div>
      </div>

      {task.status !== 'done' && due.tone === 'danger' && (
        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center gap-1.5">
          <i className="ri-alarm-warning-line text-xs text-red-500"></i>
          <span className="text-[11px] font-medium text-red-600">
            {STATUS_META[task.status].label} · needs attention
          </span>
        </div>
      )}
    </article>
  );
}
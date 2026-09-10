import { useState } from 'react';
import type { RequestStatus, RequestView } from '@/lib/types';
import { PRIORITY_META, REQUEST_STATUS_META, REQUEST_STATUS_ORDER } from '@/lib/constants';
import { dueMeta } from '@/lib/format';

interface Props {
  request: RequestView;
  onAssign: (request: RequestView) => void;
  onStage: (request: RequestView, status: RequestStatus, note?: string | null) => void;
  onDelete: (request: RequestView) => void;
}

const toneClass: Record<string, string> = {
  muted: 'text-slate-500',
  warn: 'text-amber-600',
  danger: 'text-red-600',
  done: 'text-emerald-600',
};

/** The single most likely next move for a request, given its stage. */
function primaryAction(status: RequestStatus): {
  label: string;
  icon: string;
  next: RequestStatus | 'assign';
  tone: string;
} {
  switch (status) {
    case 'new':
      return {
        label: 'Ask for clarification',
        icon: 'ri-question-line',
        next: 'needs_clarification',
        tone: 'border border-rose-200 text-rose-700 hover:bg-rose-50',
      };
    case 'needs_clarification':
      return {
        label: 'Mark ready',
        icon: 'ri-check-line',
        next: 'ready_to_assign',
        tone: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
      };
    case 'ready_to_assign':
      return {
        label: 'Assign & start',
        icon: 'ri-user-add-line',
        next: 'assign',
        tone: 'bg-[#1c2b3a] text-white hover:bg-[#0e1a26]',
      };
    case 'in_progress':
      return {
        label: 'Waiting on client',
        icon: 'ri-hourglass-2-line',
        next: 'waiting_on_client',
        tone: 'border border-stone-200 text-stone-700 hover:bg-stone-50',
      };
    case 'waiting_on_client':
      return {
        label: 'Client responded',
        icon: 'ri-play-circle-line',
        next: 'in_progress',
        tone: 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50',
      };
    case 'done':
      return {
        label: 'Reopen',
        icon: 'ri-refresh-line',
        next: 'in_progress',
        tone: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
      };
    default:
      return {
        label: 'Reopen',
        icon: 'ri-refresh-line',
        next: 'new',
        tone: 'border border-slate-200 text-slate-700 hover:bg-slate-50',
      };
  }
}

export default function RequestCard({ request, onAssign, onStage, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const status = REQUEST_STATUS_META[request.status];
  const priority = PRIORITY_META[request.priority];
  const paused = request.status === 'waiting_on_client';
  const done = request.status === 'done';
  const action = primaryAction(request.status);

  const due = request.due_date ? dueMeta(request.due_date) : null;
  const dueTone = paused ? 'muted' : due?.tone ?? 'muted';

  const chooseStage = (next: RequestStatus) => {
    setMenuOpen(false);
    if (next === 'in_progress' && !request.task_id) {
      onAssign(request);
      return;
    }
    onStage(request, next);
  };

  const handlePrimary = () => {
    if (action.next === 'assign') onAssign(request);
    else onStage(request, action.next);
  };

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#1c2b3a] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">
            {(request.clientName || request.client_name || '?').charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${status.chip}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
              {status.label}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-semibold ${priority.chip}`}>
              {priority.label}
            </span>
            <span className="text-[11px] text-slate-400">{due?.label ?? 'No due date'}</span>
          </div>

          <button type="button" onClick={() => setExpanded((v) => !v)} className="text-left cursor-pointer group">
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1c2b3a] transition-colors">
              {request.title}
            </h3>
          </button>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
              <i className="ri-building-line text-slate-400"></i>
              <span className="truncate">{request.clientName || request.client_name || 'Unknown client'}</span>
            </span>
            {request.contact_email && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                <i className="ri-mail-line text-slate-400"></i>
                <span className="truncate">{request.contact_email}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs min-w-0">
              <i className="ri-user-line text-slate-400"></i>
              {request.assigneeName ? (
                <span className="text-slate-600 truncate">{request.assigneeName}</span>
              ) : (
                <span className="text-amber-600 font-medium">Unassigned</span>
              )}
            </span>
          </div>

          {(request.status === 'needs_clarification' || request.status === 'waiting_on_client') &&
            request.clarification_note && (
            <div className="mt-2.5 flex items-start gap-2 px-3 py-2 rounded-md bg-rose-50 border border-rose-100">
              <i className="ri-question-line text-rose-500 text-sm mt-0.5"></i>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                <span className="font-semibold">Waiting on:</span> {request.clarification_note}
              </p>
            </div>
          )}

          {request.details && (
            <p className={`mt-2.5 text-xs text-slate-500 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {request.details}
            </p>
          )}

          {(due || paused) && (
            <div className="mt-2 flex flex-wrap items-center gap-3">
              {due && (
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${toneClass[dueTone]}`}>
                  <i className={paused ? 'ri-hourglass-2-line' : 'ri-calendar-line'}></i>
                  {paused ? `Paused — was ${due.label.toLowerCase()}` : due.label}
                </span>
              )}
              {paused && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500">
                  <i className="ri-shield-check-line"></i> Not counted as overdue
                </span>
              )}
            </div>
          )}

          {request.details && request.details.length > 140 && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-[11px] font-semibold text-[#1c2b3a] cursor-pointer"
            >
              {expanded ? 'Show less' : 'Read full request'}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0 sm:self-center flex-wrap">
          {!done && request.status !== 'declined' && (
            <button
              type="button"
              onClick={handlePrimary}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${action.tone}`}
            >
              <i className={action.icon}></i> {action.label}
            </button>
          )}

          {/* Stage menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-arrow-up-down-line"></i> Stage
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 mt-1.5 w-52 z-30 bg-white rounded-lg border border-slate-200 py-1.5">
                  {REQUEST_STATUS_ORDER.map((s) => {
                    const meta = REQUEST_STATUS_META[s];
                    const active = s === request.status;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => chooseStage(s)}
                        disabled={active}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                          active ? 'text-slate-300 cursor-default' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <i className={`${meta.icon} ${
                          s === 'done' ? 'text-emerald-600' : s === 'declined' ? 'text-red-500' : meta.dot.replace('bg-', 'text-')
                        }`}></i>
                        <span className="flex-1">{meta.label}</span>
                        {active && <i className="ri-check-line text-slate-400"></i>}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            aria-label="Delete request"
          >
            <i className="ri-delete-bin-6-line text-base"></i>
          </button>
        </div>
      </div>

      {confirmDelete && (
        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
          <p className="text-xs text-red-600 flex-1">Delete this request permanently?</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onDelete(request);
                setConfirmDelete(false);
              }}
              className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
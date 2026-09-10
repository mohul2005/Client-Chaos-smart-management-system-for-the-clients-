import { useState } from 'react';
import type { RequestItem } from '@/lib/types';
import { PRIORITY_META, REQUEST_STATUS_META } from '@/lib/constants';
import { relativeTime } from '@/lib/format';

interface Props {
  request: RequestItem;
  onConvert: (request: RequestItem) => void;
  onTriage: (request: RequestItem) => void;
  onDecline: (request: RequestItem) => void;
  onDelete: (request: RequestItem) => void;
}

export default function RequestCard({ request, onConvert, onTriage, onDecline, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const status = REQUEST_STATUS_META[request.status];
  const priority = PRIORITY_META[request.priority];
  const converted = request.status === 'converted';

  return (
    <article className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 rounded-lg bg-[#1c2b3a] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">
            {(request.client_name || '?').charAt(0).toUpperCase()}
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
            <span className="text-[11px] text-slate-400">{relativeTime(request.created_at)}</span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-left cursor-pointer group"
          >
            <h3 className="font-bold text-sm text-slate-900 group-hover:text-[#1c2b3a] transition-colors">
              {request.title}
            </h3>
          </button>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
              <i className="ri-building-line text-slate-400"></i>
              <span className="truncate">{request.client_name || 'Unknown client'}</span>
            </span>
            {request.contact_email && (
              <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
                <i className="ri-mail-line text-slate-400"></i>
                <span className="truncate">{request.contact_email}</span>
              </span>
            )}
          </div>

          {request.details && (
            <p className={`mt-2.5 text-xs text-slate-500 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
              {request.details}
            </p>
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
          {converted ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700">
              <i className="ri-check-double-line"></i> Converted
            </span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onConvert(request)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-[#1c2b3a] text-white text-xs font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-magic-line"></i> Convert
              </button>
              {request.status === 'new' && (
                <button
                  type="button"
                  onClick={() => onTriage(request)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-md border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-bookmark-line"></i> Triage
                </button>
              )}
              <button
                type="button"
                onClick={() => onDecline(request)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                aria-label="Decline request"
              >
                <i className="ri-close-circle-line text-base"></i>
              </button>
            </>
          )}
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
import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTaskTrail } from '@/hooks/useTaskTrail';
import { describeActivity } from '@/lib/activity';
import { AVATAR_BG } from '@/lib/constants';
import { initials, relativeTime } from '@/lib/format';
import type { Client, Profile, TaskView, TrailEntry } from '@/lib/types';

interface Props {
  task: TaskView;
  members: Profile[];
  clients: Client[];
}

export default function TaskTrail({ task, members, clients }: Props) {
  const { profile } = useAuth();
  const { comments, activity, loading, error, reload, addComment } = useTaskTrail(task.id, true);
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  const memberMap = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c.name])), [clients]);

  const nameOf = (id: string | null) => (id ? memberMap.get(id)?.full_name || 'A teammate' : 'System');
  const assigneeName = (id: string | null) => (id ? memberMap.get(id)?.full_name || 'a teammate' : 'Unassigned');
  const clientLabel = (id: string | null) => (id ? clientMap.get(id) || 'a client' : 'no client');
  const colorOf = (id: string | null) => {
    const c = id ? memberMap.get(id)?.avatar_color : null;
    return AVATAR_BG[c || 'default'] || AVATAR_BG.default;
  };

  const entries: TrailEntry[] = useMemo(() => {
    const commentEntries: TrailEntry[] = comments.map((c) => ({
      type: 'comment',
      at: c.created_at,
      comment: c,
    }));
    const activityEntries: TrailEntry[] = activity.map((a) => ({
      type: 'activity',
      at: a.created_at,
      activity: a,
    }));
    return [...commentEntries, ...activityEntries].sort(
      (x, y) => new Date(y.at).getTime() - new Date(x.at).getTime(),
    );
  }, [comments, activity]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setPosting(true);
    setPostError('');
    try {
      await addComment(draft);
      setDraft('');
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Could not post your comment. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Composer */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        <div className="flex gap-3">
          <div
            className={`w-8 h-8 rounded-full ${AVATAR_BG[profile?.avatar_color || 'default'] || AVATAR_BG.default} flex items-center justify-center text-[11px] font-bold text-white shrink-0`}
          >
            {initials(profile?.full_name || profile?.email)}
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Leave a comment so the trail explains itself — questions, updates, decisions…"
            className="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors bg-white resize-none"
          />
        </div>
        <div className="flex items-center justify-between gap-3 pl-11">
          <p className="text-[11px] text-slate-400">{draft.length}/1000</p>
          <button
            type="submit"
            disabled={posting || !draft.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#1c2b3a] text-white text-xs font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-line"></i>}
            Post comment
          </button>
        </div>
        {postError && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
            <i className="ri-error-warning-line text-red-500 text-base mt-0.5"></i>
            <p className="text-xs text-red-600 leading-relaxed">{postError}</p>
          </div>
        )}
      </form>

      <div className="h-px bg-slate-100" />

      {/* Timeline */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-100 animate-pulse shrink-0" />
              <div className="flex-1 h-12 rounded-md bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-xs text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <i className="ri-history-line text-xl text-slate-400"></i>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-0.5">No activity yet</p>
          <p className="text-xs text-slate-400">Comments and every change will show up here.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-3.5">
          {entries.map((entry) =>
            entry.type === 'comment' ? (
              <li key={`c-${entry.comment.id}`} className="flex gap-3">
                <div
                  className={`w-7 h-7 rounded-full ${colorOf(entry.comment.author_id)} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
                >
                  {initials(nameOf(entry.comment.author_id))}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-slate-800">{nameOf(entry.comment.author_id)}</span>
                    <span className="text-[11px] text-slate-400">{relativeTime(entry.comment.created_at)}</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-500">
                      <i className="ri-chat-3-line text-[10px]"></i>Comment
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                    {entry.comment.body}
                  </p>
                </div>
              </li>
            ) : (
              <li key={`a-${entry.activity.id}`} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                  <i className={`${describeActivity(entry.activity, assigneeName, clientLabel).icon} text-sm ${describeActivity(entry.activity, assigneeName, clientLabel).tone}`}></i>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-semibold text-slate-800">{nameOf(entry.activity.actor_id)}</span>{' '}
                    {describeActivity(entry.activity, assigneeName, clientLabel).text}
                    <span className="text-slate-400"> · {relativeTime(entry.activity.created_at)}</span>
                  </p>
                </div>
              </li>
            ),
          )}
        </ol>
      )}
    </div>
  );
}
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { TaskActivity, TaskComment } from '@/lib/types';

/**
 * Loads the full trail for a single task — both the discussion comments
 * and the auto-logged field changes — and lets a teammate post a comment.
 */
export function useTaskTrail(taskId: string | null, active: boolean) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    setError('');
    try {
      const [commentsRes, activityRes] = await Promise.all([
        supabase
          .from('task_comments')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true }),
        supabase
          .from('task_activity')
          .select('*')
          .eq('task_id', taskId)
          .order('created_at', { ascending: true }),
      ]);
      if (commentsRes.error) throw commentsRes.error;
      if (activityRes.error) throw activityRes.error;
      setComments((commentsRes.data || []) as TaskComment[]);
      setActivity((activityRes.data || []) as TaskActivity[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load the task history.');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (active && taskId) void load();
  }, [active, taskId, load]);

  const addComment = useCallback(
    async (body: string) => {
      const text = body.trim();
      if (!taskId || !text) return;
      const { data: userData } = await supabase.auth.getUser();
      const { error: err } = await supabase.from('task_comments').insert({
        task_id: taskId,
        author_id: userData.user?.id ?? null,
        body: text.slice(0, 1000),
      });
      if (err) throw err;
      await load();
    },
    [taskId, load],
  );

  return { comments, activity, loading, error, reload: load, addComment };
}
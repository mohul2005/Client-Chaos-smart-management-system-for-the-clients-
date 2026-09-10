import { supabase } from './supabase';

export interface NotifyResult {
  ok: boolean;
  error?: string;
  skipped?: string;
  sent?: number;
  tasks?: number;
  sentTo?: string;
}

const FUNCTION_NAME = 'task-notifications';
const SWEEP_KEY = 'tasks:lastReminderSweep';

/** The deployed origin, used to build a link back to the board inside emails. */
function boardOrigin(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

async function invoke(action: string, payload: Record<string, unknown> = {}): Promise<NotifyResult> {
  try {
    const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
      body: { action, origin: boardOrigin(), ...payload },
    });
    if (error) return { ok: false, error: error.message };
    return (data as NotifyResult) ?? { ok: false, error: 'No response from the notification service.' };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Notification service unavailable.' };
  }
}

/**
 * Fire-and-forget: email the new owner that a task was assigned to them.
 * Runs in the background so it never blocks the user's action.
 */
export function notifyAssignment(taskId: string): void {
  void invoke('assigned', { taskId });
}

/**
 * Ask the backend to nudge every owner about their overdue / due-soon work.
 * Used both by the daily sweep and the manual "send now" button.
 */
export function sendDueReminders(): Promise<NotifyResult> {
  return invoke('digest');
}

/**
 * Lightweight daily scheduler: the first teammate to open the workspace each
 * day triggers the reminder sweep. The backend de-duplicates per task, so
 * repeat calls are safe even alongside the scheduled cron job.
 */
export function runReminderSweep(): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    if (window.localStorage.getItem(SWEEP_KEY) === today) return;
    window.localStorage.setItem(SWEEP_KEY, today);
    void invoke('digest');
  } catch {
    /* storage unavailable — skip silently */
  }
}
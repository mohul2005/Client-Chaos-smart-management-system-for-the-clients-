import type { RequestBucket, RequestStatus, RequestView, TaskStatus, TaskView } from './types';

/** Start-of-today in ms, used for all overdue comparisons. */
export function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const dueMs = (due: string | null | undefined): number | null =>
  due ? new Date(`${due}T00:00:00`).getTime() : null;

/**
 * A task is "active" (and therefore eligible to be overdue / stale) unless it is
 * finished or paused waiting on the client. This is the single source of truth
 * that keeps blocked work from ever looking forgotten.
 */
export function isActiveTask(t: Pick<TaskView, 'status'>): boolean {
  return t.status !== 'done' && t.status !== 'waiting_on_client';
}

/** True only when a task is genuinely past due and not paused/finished. */
export function isTaskOverdue(t: Pick<TaskView, 'status' | 'due_date'>, todayMs = startOfTodayMs()): boolean {
  if (!isActiveTask(t)) return false;
  const ms = dueMs(t.due_date);
  return ms !== null && ms < todayMs;
}

/** A request is still "open" until it is done or declined. */
export function isRequestOpen(r: Pick<RequestView, 'status'>): boolean {
  return r.status !== 'done' && r.status !== 'declined';
}

/**
 * A request is overdue only when it is open, past due, AND not waiting on the
 * client — the whole point of the workflow is that blocked-on-client work never
 * looks stale.
 */
export function isRequestOverdue(
  r: Pick<RequestView, 'status' | 'due_date'>,
  todayMs = startOfTodayMs(),
): boolean {
  if (!isRequestOpen(r)) return false;
  if (r.status === 'waiting_on_client') return false;
  const ms = dueMs(r.due_date);
  return ms !== null && ms < todayMs;
}

/** Does a request belong in one of the manager's four buckets? (buckets overlap on purpose) */
export function requestMatchesBucket(
  r: Pick<RequestView, 'status' | 'due_date' | 'assignee_id'>,
  bucket: RequestBucket,
  todayMs = startOfTodayMs(),
): boolean {
  switch (bucket) {
    case 'waiting_for_us':
      return isRequestOpen(r) && r.status !== 'waiting_on_client';
    case 'waiting_for_client':
      return r.status === 'waiting_on_client';
    case 'unassigned':
      return isRequestOpen(r) && !r.assignee_id;
    case 'overdue':
      return isRequestOverdue(r, todayMs);
    default:
      return false;
  }
}

/** Map a board task status change back onto the linked request's pipeline stage. */
export function requestStageForTaskStatus(status: TaskStatus): RequestStatus {
  if (status === 'waiting_on_client') return 'waiting_on_client';
  if (status === 'done') return 'done';
  return 'in_progress';
}
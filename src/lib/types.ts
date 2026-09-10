export type Role = 'admin' | 'manager' | 'member';

/** Task board statuses. `waiting_on_client` is a paused state that is never overdue. */
export type TaskStatus = 'todo' | 'in_progress' | 'waiting_on_client' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * The client-request lifecycle. A request travels this pipeline on its own,
 * and only becomes a board task once it reaches `in_progress`.
 */
export type RequestStatus =
  | 'new'
  | 'needs_clarification'
  | 'ready_to_assign'
  | 'in_progress'
  | 'waiting_on_client'
  | 'done'
  | 'declined';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  avatar_color: string | null;
  reminder_lead_days: number;
  /** @deprecated superseded by assignment_emails_override + the workspace default. */
  assignment_emails: boolean;
  /** Per-teammate override: null = follow workspace default, true = always on, false = muted. */
  assignment_emails_override: boolean | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  assignee_id: string | null;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  source: string;
  /** When the task was created from a client request, the originating request id. */
  request_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestItem {
  id: string;
  client_name: string | null;
  contact_email: string | null;
  title: string;
  details: string | null;
  priority: Priority;
  status: RequestStatus;
  assignee_id: string | null;
  due_date: string | null;
  client_id: string | null;
  task_id: string | null;
  clarification_note: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

/** A recorded change made to a task by a teammate. */
export interface TaskActivity {
  id: string;
  task_id: string | null;
  actor_id: string | null;
  kind: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

/** A comment or activity event, used to render the merged task trail. */
export type TrailEntry =
  | { type: 'comment'; at: string; comment: TaskComment }
  | { type: 'activity'; at: string; activity: TaskActivity };

/** A task enriched with resolved client + assignee info for display. */
export interface TaskView extends Task {
  clientName: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
  commentCount: number;
}

/** A client request enriched with resolved client + owner info for display. */
export interface RequestView extends RequestItem {
  clientName: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
}

/** The four cross-cutting filters managers care about on the request inbox. */
export type RequestBucket = 'waiting_for_us' | 'waiting_for_client' | 'unassigned' | 'overdue';
export type Role = 'admin' | 'manager' | 'member';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  avatar_color: string | null;
  reminder_lead_days: number;
  assignment_emails: boolean;
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
  status: 'new' | 'triaged' | 'converted' | 'declined';
  created_at: string;
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
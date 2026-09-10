export type Role = 'admin' | 'manager' | 'member';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: Role;
  avatar_color: string | null;
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

/** A task enriched with resolved client + assignee info for display. */
export interface TaskView extends Task {
  clientName: string | null;
  assigneeName: string | null;
  assigneeColor: string | null;
}
import type { Priority, RequestBucket, RequestStatus, Role, TaskStatus } from './types';

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'waiting_on_client', 'review', 'done'];

export const STATUS_META: Record<
  TaskStatus,
  { label: string; short: string; dot: string; chip: string; column: string }
> = {
  todo: {
    label: 'To Do',
    short: 'To Do',
    dot: 'bg-slate-400',
    chip: 'bg-slate-100 text-slate-600 border-slate-200',
    column: 'bg-slate-100',
  },
  in_progress: {
    label: 'In Progress',
    short: 'Doing',
    dot: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-700 border-amber-200',
    column: 'bg-amber-100',
  },
  waiting_on_client: {
    label: 'Waiting on Client',
    short: 'Waiting',
    dot: 'bg-stone-500',
    chip: 'bg-stone-100 text-stone-600 border-stone-200',
    column: 'bg-stone-100',
  },
  review: {
    label: 'In Review',
    short: 'Review',
    dot: 'bg-rose-500',
    chip: 'bg-rose-100 text-rose-700 border-rose-200',
    column: 'bg-rose-100',
  },
  done: {
    label: 'Done',
    short: 'Done',
    dot: 'bg-emerald-500',
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    column: 'bg-emerald-100',
  },
};

export const PRIORITY_META: Record<
  Priority,
  { label: string; chip: string; text: string; rank: number }
> = {
  low: { label: 'Low', chip: 'bg-slate-100 text-slate-500 border-slate-200', text: 'text-slate-500', rank: 0 },
  medium: { label: 'Medium', chip: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-700', rank: 1 },
  high: { label: 'High', chip: 'bg-amber-100 text-amber-700 border-amber-200', text: 'text-amber-600', rank: 2 },
  urgent: { label: 'Urgent', chip: 'bg-red-100 text-red-700 border-red-200', text: 'text-red-600', rank: 3 },
};

export const PRIORITY_ORDER: Priority[] = ['urgent', 'high', 'medium', 'low'];

export const REQUEST_STATUS_ORDER: RequestStatus[] = [
  'new',
  'needs_clarification',
  'ready_to_assign',
  'in_progress',
  'waiting_on_client',
  'done',
  'declined',
];

export const REQUEST_STATUS_META: Record<
  RequestStatus,
  {
    label: string;
    short: string;
    chip: string;
    dot: string;
    icon: string;
    /** Who owes the next move: 'us' = our team, 'client' = the customer. */
    owner: 'us' | 'client' | null;
  }
> = {
  new: {
    label: 'New Request',
    short: 'New',
    chip: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    icon: 'ri-inbox-unarchive-line',
    owner: 'us',
  },
  needs_clarification: {
    label: 'Needs Clarification',
    short: 'Clarify',
    chip: 'bg-rose-100 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    icon: 'ri-question-line',
    owner: 'us',
  },
  ready_to_assign: {
    label: 'Ready to Assign',
    short: 'Ready',
    chip: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    icon: 'ri-user-add-line',
    owner: 'us',
  },
  in_progress: {
    label: 'In Progress',
    short: 'Doing',
    chip: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    icon: 'ri-loader-4-line',
    owner: 'us',
  },
  waiting_on_client: {
    label: 'Waiting on Client',
    short: 'Waiting',
    chip: 'bg-stone-100 text-stone-600 border-stone-200',
    dot: 'bg-stone-500',
    icon: 'ri-hourglass-2-line',
    owner: 'client',
  },
  done: {
    label: 'Done',
    short: 'Done',
    chip: 'bg-[#1c2b3a] text-white border-[#1c2b3a]',
    dot: 'bg-[#1c2b3a]',
    icon: 'ri-checkbox-circle-line',
    owner: null,
  },
  declined: {
    label: 'Declined',
    short: 'Declined',
    chip: 'bg-red-100 text-red-600 border-red-200',
    dot: 'bg-red-400',
    icon: 'ri-close-circle-line',
    owner: null,
  },
};

export const REQUEST_BUCKET_ORDER: RequestBucket[] = [
  'waiting_for_us',
  'waiting_for_client',
  'unassigned',
  'overdue',
];

export const REQUEST_BUCKET_META: Record<
  RequestBucket,
  { label: string; description: string; icon: string; text: string; bg: string; ring: string }
> = {
  waiting_for_us: {
    label: 'Waiting for us',
    description: 'Our team owes the next move',
    icon: 'ri-focus-3-line',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'border-amber-200',
  },
  waiting_for_client: {
    label: 'Waiting for the client',
    description: 'Blocked on the customer',
    icon: 'ri-hourglass-2-line',
    text: 'text-stone-600',
    bg: 'bg-stone-50',
    ring: 'border-stone-200',
  },
  unassigned: {
    label: 'Unassigned',
    description: 'No owner picked yet',
    icon: 'ri-user-unfollow-line',
    text: 'text-slate-600',
    bg: 'bg-slate-50',
    ring: 'border-slate-200',
  },
  overdue: {
    label: 'Overdue',
    description: 'Past due and not waiting on the client',
    icon: 'ri-alarm-warning-line',
    text: 'text-red-600',
    bg: 'bg-red-50',
    ring: 'border-red-200',
  },
};

export const ROLE_META: Record<Role, { label: string; chip: string }> = {
  admin: { label: 'Admin', chip: 'bg-[#1c2b3a] text-white border-[#1c2b3a]' },
  manager: { label: 'Manager', chip: 'bg-amber-100 text-amber-700 border-amber-200' },
  member: { label: 'Member', chip: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export const AVATAR_COLORS = ['slate', 'amber', 'rose', 'emerald', 'sky', 'violet'];

export const AVATAR_BG: Record<string, string> = {
  slate: 'bg-slate-700',
  amber: 'bg-amber-600',
  rose: 'bg-rose-600',
  emerald: 'bg-emerald-700',
  sky: 'bg-slate-500',
  violet: 'bg-stone-600',
  default: 'bg-slate-700',
};
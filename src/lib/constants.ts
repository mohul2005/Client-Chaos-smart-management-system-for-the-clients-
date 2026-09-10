import type { Priority, RequestItem, Role, TaskStatus } from './types';

export const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];

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

export const REQUEST_STATUS_ORDER: RequestItem['status'][] = ['new', 'triaged', 'converted', 'declined'];

export const REQUEST_STATUS_META: Record<
  RequestItem['status'],
  { label: string; chip: string; dot: string }
> = {
  new: { label: 'New', chip: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  triaged: { label: 'Triaged', chip: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  converted: { label: 'Converted', chip: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  declined: { label: 'Declined', chip: 'bg-red-100 text-red-600 border-red-200', dot: 'bg-red-400' },
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
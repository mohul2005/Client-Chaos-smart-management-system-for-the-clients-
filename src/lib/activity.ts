import { PRIORITY_META, STATUS_META } from './constants';
import { formatDate } from './format';
import type { Priority, TaskStatus } from './types';

export interface ActivityInput {
  kind: string;
  field: string | null;
  old_value: string | null;
  new_value: string | null;
}

export interface ActivityView {
  icon: string;
  tone: string;
  text: string;
}

const statusLabel = (v: string | null) =>
  v && v in STATUS_META ? STATUS_META[v as TaskStatus].label : 'Not started';

const priorityLabel = (v: string | null) =>
  v && v in PRIORITY_META ? PRIORITY_META[v as Priority].label : 'None';

/**
 * Turn a raw activity record into a human-readable description,
 * resolving member / client ids to names where needed.
 */
export function describeActivity(
  a: ActivityInput,
  memberName: (id: string | null) => string,
  clientName: (id: string | null) => string,
): ActivityView {
  switch (a.kind) {
    case 'created':
      return { icon: 'ri-add-circle-line', tone: 'text-emerald-600', text: 'created this task' };
    case 'converted':
      return {
        icon: 'ri-magic-line',
        tone: 'text-amber-600',
        text: 'created this task from a client request',
      };
    case 'status':
      return {
        icon: 'ri-arrow-left-right-line',
        tone: 'text-[#1c2b3a]',
        text: `moved the status from ${statusLabel(a.old_value)} to ${statusLabel(a.new_value)}`,
      };
    case 'priority':
      return {
        icon: 'ri-flag-line',
        tone: 'text-amber-600',
        text: `changed the priority from ${priorityLabel(a.old_value)} to ${priorityLabel(a.new_value)}`,
      };
    case 'assignee':
      return a.new_value
        ? { icon: 'ri-user-follow-line', tone: 'text-[#1c2b3a]', text: `assigned this to ${memberName(a.new_value)}` }
        : { icon: 'ri-user-unfollow-line', tone: 'text-slate-500', text: 'left this unassigned' };
    case 'due_date':
      return a.new_value
        ? { icon: 'ri-calendar-line', tone: 'text-[#1c2b3a]', text: `set the due date to ${formatDate(a.new_value)}` }
        : { icon: 'ri-calendar-line', tone: 'text-slate-500', text: 'cleared the due date' };
    case 'client':
      return a.new_value
        ? { icon: 'ri-briefcase-4-line', tone: 'text-[#1c2b3a]', text: `linked this to ${clientName(a.new_value)}` }
        : { icon: 'ri-close-circle-line', tone: 'text-slate-500', text: 'removed the client link' };
    case 'title':
      return { icon: 'ri-text', tone: 'text-slate-500', text: 'renamed the task' };
    case 'description':
      return { icon: 'ri-file-text-line', tone: 'text-slate-500', text: 'updated the details' };
    default:
      return { icon: 'ri-history-line', tone: 'text-slate-500', text: 'updated the task' };
  }
}
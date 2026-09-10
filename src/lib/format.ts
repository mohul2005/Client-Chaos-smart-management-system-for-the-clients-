export function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join('');
}

export function formatDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export type DueTone = 'muted' | 'warn' | 'danger' | 'done';

export function dueMeta(due?: string | null): { label: string; tone: DueTone } {
  if (!due) return { label: 'No due date', tone: 'muted' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${due}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { label: 'No due date', tone: 'muted' };
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff < 0) {
    const n = Math.abs(diff);
    return { label: `${n} day${n === 1 ? '' : 's'} overdue`, tone: 'danger' };
  }
  if (diff === 0) return { label: 'Due today', tone: 'warn' };
  if (diff === 1) return { label: 'Due tomorrow', tone: 'warn' };
  if (diff <= 7) return { label: `Due in ${diff} days`, tone: 'warn' };
  return { label: `Due ${formatDate(due)}`, tone: 'muted' };
}

export function relativeTime(value: string): string {
  const d = new Date(value);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(value.slice(0, 10));
}

export function todayISO(): string {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}
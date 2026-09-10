import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useRequests } from '@/hooks/useRequests';
import { useAuth } from '@/context/AuthContext';
import type { TaskView } from '@/lib/types';
import { PRIORITY_ORDER, STATUS_ORDER } from '@/lib/constants';
import { dueMeta } from '@/lib/format';
import MetricCards, { type Metric } from './components/MetricCards';
import WorkloadPanel, { type WorkloadRow } from './components/WorkloadPanel';
import DistributionPanel from './components/DistributionPanel';
import AttentionPanel from './components/AttentionPanel';
import TriagePanel from './components/TriagePanel';
import ReminderPanel from './components/ReminderPanel';

export default function OverviewPage() {
  const { tasks, members, loading, error, reload } = useWorkspace();
  const { requests } = useRequests();
  const { profile } = useAuth();

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const data = useMemo(() => {
    const isOverdue = (t: TaskView) =>
      t.status !== 'done' && !!t.due_date && new Date(`${t.due_date}T00:00:00`).getTime() < startOfToday;

    const openTasks = tasks.filter((t) => t.status !== 'done');
    const overdue = openTasks.filter(isOverdue);
    const inProgress = tasks.filter((t) => t.status === 'in_progress');
    const completed = tasks.filter((t) => t.status === 'done');

    const statusCounts: Record<string, number> = {};
    STATUS_ORDER.forEach((s) => {
      statusCounts[s] = 0;
    });
    tasks.forEach((t) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });

    const priorityCounts: Record<string, number> = {};
    PRIORITY_ORDER.forEach((p) => {
      priorityCounts[p] = 0;
    });
    openTasks.forEach((t) => {
      priorityCounts[t.priority] = (priorityCounts[t.priority] || 0) + 1;
    });

    const workload: WorkloadRow[] = members
      .map((m) => {
        const mine = tasks.filter((t) => t.assignee_id === m.id);
        return {
          member: m,
          open: mine.filter((t) => t.status !== 'done').length,
          overdue: mine.filter(isOverdue).length,
          done: mine.filter((t) => t.status === 'done').length,
        };
      })
      .sort((a, b) => b.open - a.open);

    const toneRank = (t: TaskView) => (dueMeta(t.due_date).tone === 'danger' ? 0 : 1);
    const attention = openTasks
      .filter((t) => {
        const tone = dueMeta(t.due_date).tone;
        return tone === 'danger' || tone === 'warn';
      })
      .sort((a, b) => {
        if (toneRank(a) !== toneRank(b)) return toneRank(a) - toneRank(b);
        return (a.due_date || '9999-99-99').localeCompare(b.due_date || '9999-99-99');
      })
      .slice(0, 6);

    return {
      openTasks,
      overdue,
      dueSoon: openTasks.filter((t) => dueMeta(t.due_date).tone === 'warn').length,
      inProgress,
      completed,
      statusCounts,
      priorityCounts,
      workload,
      attention,
      newRequests: requests.filter((r) => r.status === 'new').length,
      triaged: requests.filter((r) => r.status === 'triaged').length,
      converted: requests.filter((r) => r.status === 'converted').length,
      declined: requests.filter((r) => r.status === 'declined').length,
    };
  }, [tasks, members, requests, startOfToday]);

  const maxOpen = Math.max(1, ...data.workload.map((w) => w.open));
  const total = tasks.length;
  const doneRate = total > 0 ? Math.round((data.completed.length / total) * 100) : 0;

  const metrics: Metric[] = [
    {
      label: 'Open work',
      value: data.openTasks.length,
      icon: 'ri-list-check-2',
      valueTone: 'text-slate-900',
      iconTone: 'text-slate-600',
      iconBg: 'bg-slate-100',
      hint: `${total} task${total === 1 ? '' : 's'} total`,
    },
    {
      label: 'Overdue',
      value: data.overdue.length,
      icon: 'ri-alarm-warning-line',
      valueTone: 'text-red-600',
      iconTone: 'text-red-600',
      iconBg: 'bg-red-50',
      hint: data.overdue.length ? 'Needs attention now' : 'Nothing overdue',
    },
    {
      label: 'In progress',
      value: data.inProgress.length,
      icon: 'ri-loader-4-line',
      valueTone: 'text-amber-600',
      iconTone: 'text-amber-600',
      iconBg: 'bg-amber-50',
      hint: 'Being worked on',
    },
    {
      label: 'Completed',
      value: data.completed.length,
      icon: 'ri-checkbox-circle-line',
      valueTone: 'text-emerald-600',
      iconTone: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      hint: `${doneRate}% completion rate`,
    },
    {
      label: 'New requests',
      value: data.newRequests,
      icon: 'ri-inbox-unarchive-line',
      valueTone: 'text-[#1c2b3a]',
      iconTone: 'text-[#1c2b3a]',
      iconBg: 'bg-slate-100',
      hint: 'Awaiting triage',
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const firstName = (profile?.full_name || '').split(' ')[0];

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-80 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-80 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-slate-400">{today}</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
            {greeting}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Here is how the agency is doing at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/app/requests"
            className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-inbox-archive-line"></i> Inbox
          </Link>
          <Link
            to="/app/board"
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-layout-column-line"></i> Open board
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <i className="ri-error-warning-line text-red-500"></i>
            <p className="text-sm text-red-600">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {/* Overdue alert */}
      {!error && data.overdue.length > 0 && (
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <i className="ri-alarm-warning-line text-red-600"></i>
            </div>
            <p className="text-sm text-red-700">
              <strong>{data.overdue.length}</strong> task{data.overdue.length === 1 ? '' : 's'} overdue across the team.
            </p>
          </div>
          <Link
            to="/app/board"
            className="self-start sm:self-auto px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Review overdue
          </Link>
        </div>
      )}

      {/* KPI strip */}
      <MetricCards metrics={metrics} />

      {/* Main grid */}
      {total === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-dashboard-3-line text-2xl text-slate-400"></i>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">No data to summarise yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Once there are tasks on the board, this overview will show workload, progress and what needs attention.
          </p>
          <Link
            to="/app/board"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i> Go to the board
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <WorkloadPanel rows={data.workload} maxOpen={maxOpen} />
            <AttentionPanel items={data.attention} />
          </div>
          <div className="flex flex-col gap-4">
            <DistributionPanel
              statusCounts={data.statusCounts}
              priorityCounts={data.priorityCounts}
              total={total}
              openTotal={data.openTasks.length}
            />
            <TriagePanel
              newCount={data.newRequests}
              triaged={data.triaged}
              converted={data.converted}
              declined={data.declined}
            />
            <ReminderPanel overdueCount={data.overdue.length} dueSoonCount={data.dueSoon} />
          </div>
        </div>
      )}
    </div>
  );
}
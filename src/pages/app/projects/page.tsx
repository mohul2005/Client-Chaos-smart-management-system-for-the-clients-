import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace, type ProjectInput } from '@/hooks/useWorkspace';
import type { ProjectStatus, ProjectView } from '@/lib/types';
import { PROJECT_ACCENT_BG, PROJECT_STATUS_META, PROJECT_STATUS_ORDER } from '@/lib/constants';
import ProjectModal from './components/ProjectModal';

type StatusFilter = 'all' | ProjectStatus;

export default function ProjectsPage() {
  const { projects, clients, loading, error, reload, createProject, updateProject, deleteProject, seedSampleProjects } =
    useWorkspace();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectView | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const stats = useMemo(() => {
    const openTasks = projects.reduce((sum, p) => sum + p.openTasks, 0);
    const overdue = projects.reduce((sum, p) => sum + p.overdueTasks, 0);
    const active = projects.filter((p) => p.status === 'active').length;
    const withTasks = projects.filter((p) => p.totalTasks > 0);
    const avg = withTasks.length
      ? Math.round(withTasks.reduce((sum, p) => sum + p.progress, 0) / withTasks.length)
      : 0;
    return [
      { label: 'Projects', value: projects.length, icon: 'ri-folders-line', tone: 'text-slate-700' },
      { label: 'Active', value: active, icon: 'ri-play-circle-line', tone: 'text-emerald-600' },
      { label: 'Open tasks', value: openTasks, icon: 'ri-list-check-2', tone: 'text-slate-700' },
      { label: 'Overdue', value: overdue, icon: 'ri-alarm-warning-line', tone: 'text-red-600' },
      { label: 'Avg progress', value: `${avg}%`, icon: 'ri-line-chart-line', tone: 'text-amber-600' },
    ];
  }, [projects]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (q && !`${p.name} ${p.description ?? ''} ${p.clientName ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projects, query, statusFilter]);

  const handleSave = async (id: string | null, input: ProjectInput) => {
    if (id) await updateProject(id, input);
    else await createProject(input);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedSampleProjects();
    } catch {
      // surfaced via the shared error state on reload
    } finally {
      setSeeding(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* Stats */}
      <div className="stats-grid grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{s.label}</span>
              <div className="w-7 h-7 rounded-md bg-slate-50 flex items-center justify-center">
                <i className={`${s.icon} text-base ${s.tone}`}></i>
              </div>
            </div>
            <p className={`text-2xl font-black ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-4 mb-5 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1 min-w-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <i className="ri-search-line text-slate-400 text-base"></i>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 rounded-full bg-slate-100">
            {(['all', ...PROJECT_STATUS_ORDER] as StatusFilter[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  statusFilter === s ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s === 'all' ? 'All' : PROJECT_STATUS_META[s].label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line text-base"></i> New project
          </button>
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

      {loading && !error ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-52 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-folders-line text-2xl text-slate-400"></i>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">No projects yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Projects group related tasks so you can track progress in one place. Create one, or load a realistic sample set.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleSeed()}
              disabled={seeding || clients.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              {seeding ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-magic-line"></i>}
              Load sample projects
            </button>
            <button
              type="button"
              onClick={openNew}
              className="px-5 py-2.5 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Create a project
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">No projects match this view.</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
            }}
            className="mt-3 text-sm font-semibold text-[#1c2b3a] cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const meta = PROJECT_STATUS_META[p.status];
            const accent = PROJECT_ACCENT_BG[p.color || 'default'] || PROJECT_ACCENT_BG.default;
            return (
              <article key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                <div className={`h-1.5 w-full ${accent}`}></div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 leading-snug truncate">{p.name}</h3>
                      {p.clientName && (
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                          <i className="ri-briefcase-4-line text-xs"></i>
                          <span className="truncate">{p.clientName}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        aria-label="Edit project"
                      >
                        <i className="ri-edit-line text-base"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(p.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        aria-label="Delete project"
                      >
                        <i className="ri-delete-bin-6-line text-base"></i>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold border ${meta.chip}`}>
                      <i className={`${meta.icon} text-xs`}></i>
                      {meta.label}
                    </span>
                  </div>

                  {p.description && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                  )}

                  {/* Progress */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">Progress</span>
                      <span className="text-[11px] font-bold text-slate-700">{p.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
                      <div
                        className={`h-full rounded-full ${accent} transition-all duration-500`}
                        style={{ width: `${p.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-700">
                        <i className="ri-time-line text-xs"></i> {p.openTasks} open
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                        <i className="ri-checkbox-circle-line text-xs"></i> {p.doneTasks} done
                      </span>
                      {p.overdueTasks > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 border border-red-200 text-[11px] font-semibold text-red-600">
                          <i className="ri-alarm-warning-line text-xs"></i> {p.overdueTasks} overdue
                        </span>
                      )}
                    </div>
                  </div>

                  {confirmId === p.id && (
                    <div className="mt-3 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
                      <p className="text-xs text-red-600 mb-2">Delete this project? Its tasks stay but lose the project link.</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void deleteProject(p.id).finally(() => setConfirmId(null));
                          }}
                          className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmId(null)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-500 hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className="mt-5 flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-500">
            <i className="ri-information-line mr-1"></i>
            Project tasks live on the board — open it to assign, reprioritise or drag work across columns.
          </p>
          <Link
            to="/app/board"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-layout-column-line"></i> Open board
          </Link>
        </div>
      )}

      <ProjectModal
        open={modalOpen}
        project={editing}
        clients={clients}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
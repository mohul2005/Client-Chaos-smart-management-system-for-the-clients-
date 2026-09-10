import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRequests, type ConvertPayload } from '@/hooks/useRequests';
import type { RequestItem } from '@/lib/types';
import { REQUEST_STATUS_META, REQUEST_STATUS_ORDER } from '@/lib/constants';
import RequestCard from './components/RequestCard';
import ConvertRequestModal from './components/ConvertRequestModal';

type Tab = 'all' | RequestItem['status'];

export default function RequestsInboxPage() {
  const {
    requests,
    clients,
    members,
    loading,
    error,
    reload,
    setStatus,
    deleteRequest,
    convertToTask,
    seedSampleRequests,
  } = useRequests();

  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [convertTarget, setConvertTarget] = useState<RequestItem | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [copied, setCopied] = useState(false);

  const counts = useMemo(() => {
    const map: Record<RequestItem['status'], number> = { new: 0, triaged: 0, converted: 0, declined: 0 };
    requests.forEach((r) => {
      map[r.status] += 1;
    });
    return map;
  }, [requests]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (tab !== 'all' && r.status !== tab) return false;
      if (q && !`${r.title} ${r.details ?? ''} ${r.client_name ?? ''} ${r.contact_email ?? ''}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [requests, tab, query]);

  const stats = [
    { label: 'New requests', value: counts.new, icon: 'ri-inbox-unarchive-line', tone: 'text-amber-600' },
    { label: 'In triage', value: counts.triaged, icon: 'ri-bookmark-line', tone: 'text-slate-700' },
    { label: 'Converted', value: counts.converted, icon: 'ri-checkbox-circle-line', tone: 'text-emerald-600' },
    { label: 'Total received', value: requests.length, icon: 'ri-stack-line', tone: 'text-slate-700' },
  ];

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: requests.length },
    ...REQUEST_STATUS_ORDER.map((s) => ({ key: s as Tab, label: REQUEST_STATUS_META[s].label, count: counts[s] })),
  ];

  const intakeUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    const prefix = (__BASE_PATH__ || '').replace(/\/$/, '');
    return `${base}${prefix}/request`;
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(intakeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleConvert = (request: RequestItem, payload: ConvertPayload) => convertToTask(request, payload);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedSampleRequests();
    } catch {
      // surfaced via shared error state on reload
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="w-full">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
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

      {/* Intake link banner */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 rounded-lg bg-[#1c2b3a] text-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <i className="ri-link text-base text-white/60 shrink-0"></i>
          <div className="min-w-0">
            <p className="text-xs font-semibold">Your public request link</p>
            <p className="text-[11px] text-white/50 truncate">{intakeUrl}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void copyLink()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <Link
            to="/request"
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-white text-[#1c2b3a] text-xs font-semibold hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-external-link-line"></i> Open form
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-4 mb-5 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-full">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                tab === t.key ? 'bg-[#1c2b3a] text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-white/20 text-white' : 'bg-white text-slate-500'
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-72">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <i className="ri-search-line text-slate-400 text-base"></i>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search requests…"
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Error */}
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

      {/* List */}
      {loading && !error ? (
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-inbox-archive-line text-2xl text-slate-400"></i>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">The inbox is clear</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            No requests yet. Share your public request link, or drop in a few realistic samples to see triage in action.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => void handleSeed()}
              disabled={seeding}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              {seeding ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-magic-line"></i>}
              Load sample requests
            </button>
            <Link
              to="/request"
              className="px-5 py-2.5 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              Open the intake form
            </Link>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <p className="text-sm text-slate-500">No requests match this view.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              onConvert={(req) => setConvertTarget(req)}
              onTriage={(req) => void setStatus(req.id, 'triaged')}
              onDecline={(req) => void setStatus(req.id, 'declined')}
              onDelete={(req) => void deleteRequest(req.id)}
            />
          ))}
        </div>
      )}

      <ConvertRequestModal
        open={Boolean(convertTarget)}
        request={convertTarget}
        clients={clients}
        members={members}
        onClose={() => setConvertTarget(null)}
        onConvert={handleConvert}
      />
    </div>
  );
}
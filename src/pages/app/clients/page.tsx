import { useMemo, useState } from 'react';
import { useWorkspace } from '@/hooks/useWorkspace';
import type { Client } from '@/lib/types';
import ClientModal from './components/ClientModal';

export default function ClientsPage() {
  const { clients, tasks, loading, error, reload, createClient, updateClient, deleteClient } = useWorkspace();
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const taskCounts = useMemo(() => {
    const open = new Map<string, number>();
    const total = new Map<string, number>();
    tasks.forEach((t) => {
      if (!t.client_id) return;
      total.set(t.client_id, (total.get(t.client_id) || 0) + 1);
      if (t.status !== 'done') open.set(t.client_id, (open.get(t.client_id) || 0) + 1);
    });
    return { open, total };
  }, [tasks]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      `${c.name} ${c.contact_name ?? ''} ${c.email ?? ''}`.toLowerCase().includes(q),
    );
  }, [clients, query]);

  const handleSave = async (id: string | null, input: Omit<Client, 'id' | 'created_at'>) => {
    if (id) await updateClient(id, input);
    else await createClient(input);
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg border border-slate-200 p-3 md:p-4 mb-5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 min-w-0">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
            <i className="ri-search-line text-slate-400 text-base"></i>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients…"
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line text-base"></i> New client
        </button>
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <i className="ri-briefcase-4-line text-2xl text-slate-400"></i>
          </div>
          <h3 className="font-bold text-lg text-slate-900 mb-1">No clients yet</h3>
          <p className="text-sm text-slate-500 mb-6">Add the accounts your team delivers for.</p>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
          >
            Add your first client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => {
            const open = taskCounts.open.get(c.id) || 0;
            const total = taskCounts.total.get(c.id) || 0;
            return (
              <article key={c.id} className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#1c2b3a] flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-white">{c.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(c);
                        setModalOpen(true);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      aria-label="Edit client"
                    >
                      <i className="ri-edit-line text-base"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmId(c.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      aria-label="Delete client"
                    >
                      <i className="ri-delete-bin-6-line text-base"></i>
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1">{c.name}</h3>
                {c.contact_name && <p className="text-xs text-slate-500 mb-3">{c.contact_name}</p>}

                <div className="flex flex-col gap-1.5 mb-4 flex-1">
                  {c.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                      <i className="ri-mail-line text-slate-400"></i>
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <i className="ri-phone-line text-slate-400"></i>
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-700">
                    <i className="ri-time-line text-xs"></i> {open} open
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600">
                    <i className="ri-stack-line text-xs"></i> {total} total
                  </span>
                </div>

                {confirmId === c.id && (
                  <div className="mt-3 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
                    <p className="text-xs text-red-600 mb-2">Delete this client? Their tasks stay but lose the link.</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void deleteClient(c.id).finally(() => setConfirmId(null));
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
              </article>
            );
          })}
        </div>
      )}

      <ClientModal
        open={modalOpen}
        client={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
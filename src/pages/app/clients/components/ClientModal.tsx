import { useEffect, useState, type FormEvent } from 'react';
import type { Client } from '@/lib/types';

interface Props {
  open: boolean;
  client: Client | null;
  onClose: () => void;
  onSave: (id: string | null, input: Omit<Client, 'id' | 'created_at'>) => Promise<void>;
}

const empty = { name: '', contact_name: '', email: '', phone: '', notes: '' };

export default function ClientModal({ open, client, onClose, onSave }: Props) {
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm(
      client
        ? {
            name: client.name,
            contact_name: client.contact_name || '',
            email: client.email || '',
            phone: client.phone || '',
            notes: client.notes || '',
          }
        : empty,
    );
  }, [open, client]);

  if (!open) return null;

  const inputClass =
    'w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors bg-white';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('A client needs a name.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSave(client?.id ?? null, {
        name: form.name.trim(),
        contact_name: form.contact_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        notes: form.notes.trim() || null,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the client.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900">{client ? 'Edit client' : 'New client'}</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 cursor-pointer"
            aria-label="Close"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className={labelClass}>Client / company name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Northwind Retail"
              className={inputClass}
              autoFocus
            />
          </div>
          <div>
            <label className={labelClass}>Main contact</label>
            <input
              type="text"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              placeholder="Alex Morgan"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex@northwind.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (415) 555-0134"
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="Retainer, key contacts, quirks…"
              className={`${inputClass} resize-none`}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <i className="ri-error-warning-line text-red-500 text-base mt-0.5"></i>
              <p className="text-xs text-red-600 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              {busy && <i className="ri-loader-4-line animate-spin"></i>}
              {client ? 'Save changes' : 'Add client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
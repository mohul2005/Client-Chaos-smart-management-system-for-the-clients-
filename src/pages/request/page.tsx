import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Priority } from '@/lib/types';

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Low — whenever you get a chance' },
  { value: 'medium', label: 'Normal — this week is fine' },
  { value: 'high', label: 'High — we need it soon' },
  { value: 'urgent', label: 'Urgent — this is blocking us' },
];

const steps = [
  { icon: 'ri-send-plane-line', title: 'Tell us what you need', body: 'A clear request with as much detail as you can share.' },
  { icon: 'ri-inbox-archive-line', title: 'It lands in our queue', body: 'No more lost emails or half-read group chats.' },
  { icon: 'ri-user-star-line', title: 'Someone owns it', body: 'We assign an owner, a priority and a due date — then track it.' },
];

export default function RequestIntakePage() {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!clientName.trim()) {
      setError('Please tell us who you are (company or name).');
      return;
    }
    if (!email.trim()) {
      setError('We need an email so we can follow up.');
      return;
    }
    if (!title.trim()) {
      setError('Give your request a short title.');
      return;
    }
    setBusy(true);
    try {
      const { error: err } = await supabase.from('requests').insert({
        client_name: clientName.trim(),
        contact_email: email.trim(),
        title: title.trim(),
        details: details.trim() || null,
        priority,
        status: 'new',
      });
      if (err) throw err;
      setSubmitted(title.trim());
      setClientName('');
      setEmail('');
      setTitle('');
      setDetails('');
      setPriority('medium');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your request. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors bg-white';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5';

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col">
      {/* Slim header */}
      <header className="h-16 shrink-0 bg-white border-b border-slate-200">
        <div className="h-full px-5 md:px-10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-checkbox-multiple-line text-xl text-[#1c2b3a]"></i>
            </div>
            <span className="font-black text-slate-900 text-sm tracking-widest uppercase">TASKS.</span>
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-user-line text-base"></i>
            <span className="hidden sm:inline">Team login</span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Brand / explainer panel */}
        <div className="relative lg:w-[44%] bg-[#0e1a26] text-white px-6 md:px-12 py-10 lg:py-16 flex flex-col justify-center overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #4a7a9b 1px, transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />
          <div className="relative max-w-md">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Client Request Portal</p>
            <h1 className="font-black text-3xl md:text-4xl leading-tight mb-4">
              Got work for us? Send it straight to our queue.
            </h1>
            <p className="text-sm text-white/60 leading-relaxed mb-10">
              Skip the lost email and the "did anyone see this?" messages. Submit your request and it becomes a tracked
              piece of work with an owner and a deadline.
            </p>

            <div className="flex flex-col gap-5">
              {steps.map((s, i) => (
                <div key={s.icon} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <i className={`${s.icon} text-base text-white/80`}></i>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      <span className="text-white/40 mr-1">{i + 1}.</span>
                      {s.title}
                    </p>
                    <p className="text-xs text-white/50 leading-relaxed mt-0.5">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-5 md:px-10 py-10 lg:py-16">
          <div className="w-full max-w-lg">
            {submitted ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-5">
                  <i className="ri-checkbox-circle-line text-3xl text-emerald-600"></i>
                </div>
                <h2 className="font-black text-2xl text-slate-900 mb-2">Request received</h2>
                <p className="text-sm text-slate-500 leading-relaxed mb-1">
                  Thanks — we've got your request:
                </p>
                <p className="text-sm font-semibold text-slate-800 mb-6">"{submitted}"</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-8">
                  It's now in our queue and someone will pick it up, assigning an owner and a due date. We'll follow up
                  by email if we need anything else.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(null)}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line text-base"></i> Submit another request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8">
                <h2 className="font-black text-2xl text-slate-900 mb-1">Submit a request</h2>
                <p className="text-sm text-slate-500 mb-7">
                  Tell us what you need and we'll take it from there.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Company or your name</label>
                      <input
                        type="text"
                        name="client_name"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Northwind Retail"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Your email</label>
                      <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        autoComplete="email"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>What do you need?</label>
                    <input
                      type="text"
                      name="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Add a holiday promo banner to the homepage"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Details</label>
                    <textarea
                      name="details"
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      rows={4}
                      maxLength={500}
                      placeholder="Share the context, links, deadlines — anything that helps us get it right."
                      className={`${inputClass} resize-none`}
                    />
                    <p className="mt-1 text-[11px] text-slate-400 text-right">{details.length}/500</p>
                  </div>

                  <div>
                    <label className={labelClass}>How urgent is it?</label>
                    <select
                      name="priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className={`${inputClass} cursor-pointer`}
                    >
                      {priorityOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
                      <i className="ri-error-warning-line text-red-500 text-base mt-0.5"></i>
                      <p className="text-xs text-red-600 leading-relaxed">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 w-full py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {busy ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-send-plane-line text-base"></i>}
                    Send request
                  </button>
                </form>

                <p className="mt-5 text-[11px] text-slate-400 text-center leading-relaxed">
                  Signed-in team member?{' '}
                  <Link to="/login" className="text-[#1c2b3a] font-semibold cursor-pointer">
                    Go to the workspace
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
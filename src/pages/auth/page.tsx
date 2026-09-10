import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

type Mode = 'signin' | 'signup';

const highlights = [
  { icon: 'ri-layout-column-line', text: 'One shared board for every client task' },
  { icon: 'ri-user-star-line', text: 'Clear owner, priority and due date' },
  { icon: 'ri-line-chart-line', text: 'Live view of what is slipping' },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const redirectTo = (location.state as { from?: string } | null)?.from || '/app/board';

  useEffect(() => {
    if (session) navigate(redirectTo, { replace: true });
  }, [session, navigate, redirectTo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() || email.split('@')[0] } },
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* Brand panel */}
      <div className="relative lg:w-[46%] bg-[#0e1a26] text-white px-8 md:px-14 py-10 lg:py-14 flex flex-col justify-between overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #4a7a9b 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-checkbox-multiple-line text-xl"></i>
            </div>
            <span className="font-black text-sm tracking-widest uppercase">TASKS.</span>
          </Link>
        </div>

        <div className="relative my-12 lg:my-0">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-white/40 mb-4">Lala Ops Workspace</p>
          <h1 className="font-black text-3xl md:text-4xl leading-tight mb-5 max-w-md">
            Stop losing work between the spreadsheets and the group chat.
          </h1>
          <p className="text-sm text-white/60 leading-relaxed max-w-md mb-10">
            Every client request becomes a tracked task with an owner, a priority and a deadline. One board, full visibility.
          </p>
          <div className="flex flex-col gap-4">
            {highlights.map((h) => (
              <div key={h.icon} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <i className={`${h.icon} text-base text-white/80`}></i>
                </div>
                <span className="text-sm text-white/70">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/25">© {new Date().getFullYear()} Lala Tech LLC</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 md:px-10 py-14">
        <div className="w-full max-w-sm">
          <div className="inline-flex p-1 bg-slate-100 rounded-full mb-8">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError('');
                }}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  mode === m ? 'bg-[#1c2b3a] text-white' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {m === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <h2 className="font-black text-2xl text-slate-900 mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Join the workspace'}
          </h2>
          <p className="text-sm text-slate-500 mb-7">
            {mode === 'signin'
              ? 'Sign in to open your team board.'
              : 'Create your account to start tracking client work.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <i className="ri-user-line text-slate-400 text-base"></i>
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jordan Reyes"
                    autoComplete="name"
                    className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Work email</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-mail-line text-slate-400 text-base"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@lalatech.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                  <i className="ri-lock-line text-slate-400 text-base"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-md border border-slate-200 focus:border-[#1c2b3a] focus:outline-none transition-colors"
                />
              </div>
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
              className="mt-2 w-full py-2.5 rounded-md bg-[#1c2b3a] text-white text-sm font-semibold hover:bg-[#0e1a26] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {busy && <i className="ri-loader-4-line animate-spin"></i>}
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
            {mode === 'signin' ? "Don't have an account yet? " : 'Already have an account? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError('');
              }}
              className="text-[#1c2b3a] font-semibold cursor-pointer"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
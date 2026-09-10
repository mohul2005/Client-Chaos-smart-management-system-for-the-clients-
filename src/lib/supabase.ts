import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Single shared Supabase client for the whole app.
 * A custom lock is used to avoid cross-tab Navigator LockManager contention
 * that can otherwise freeze auth calls on refresh.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    lock: (_name: string, _acquireTimeout: number, fn: () => Promise<unknown>) => fn(),
  },
});
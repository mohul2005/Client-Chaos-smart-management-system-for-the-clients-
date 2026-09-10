import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setProfile(data as Profile);
        return;
      }
      // Fallback: create the profile row if the trigger did not run yet.
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (user) {
        const fallback = {
          id: user.id,
          full_name: (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Teammate',
          email: user.email ?? null,
          role: 'member' as const,
          avatar_color: 'slate',
        };
        const { data: inserted } = await supabase
          .from('profiles')
          .upsert(fallback, { onConflict: 'id' })
          .select()
          .maybeSingle();
        if (inserted) setProfile(inserted as Profile);
      }
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        setSession(data.session);
        setLoading(false);
        if (data.session?.user) {
          // Defer so we are outside the auth lock context before hitting the DB.
          window.setTimeout(() => {
            if (mounted) void loadProfile(data.session!.user.id);
          }, 0);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // MUST stay synchronous: no async/await inside this callback.
      setSession(nextSession);
      if (nextSession?.user) {
        const uid = nextSession.user.id;
        window.setTimeout(() => {
          if (mounted) void loadProfile(uid);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, profile, loading, signOut, refreshProfile }),
    [session, profile, loading, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
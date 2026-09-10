import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50">
      <div className="w-10 h-10 flex items-center justify-center animate-spin">
        <i className="ri-loader-4-line text-2xl text-[#1c2b3a]"></i>
      </div>
      <p className="mt-4 text-sm text-slate-500">Loading your workspace…</p>
    </div>
  );
}

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
}
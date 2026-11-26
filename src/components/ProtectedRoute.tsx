import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-6">
        <div className="bg-white border border-[#E6E7E0] rounded-2xl px-8 py-6 text-center max-w-sm w-full">
          <div className="w-8 h-8 rounded-full border-2 border-[#2F6B52] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-[#183C32]">Verifying your workspace session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

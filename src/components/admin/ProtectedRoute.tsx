import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-casino-felt-pattern">
        <span className="font-display text-2xl uppercase tracking-widest text-gold-glow">
          Loading…
        </span>
      </div>
    );
  }
  if (!session) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

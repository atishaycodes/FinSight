import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-ink-3 text-[13px] font-sans">Loading…</div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

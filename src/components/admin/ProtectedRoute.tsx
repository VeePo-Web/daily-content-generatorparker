import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, adminLoading, loading } = useAuth();
  const location = useLocation();

  if (loading || (requireAdmin && adminLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/ops-portal/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-light tracking-wider text-foreground mb-2">
            ACCESS DENIED
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            You don't have permission to access this area.
          </p>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;

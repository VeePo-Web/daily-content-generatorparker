import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedAccountRouteProps {
  children: ReactNode;
}

export default function ProtectedAccountRoute({ children }: ProtectedAccountRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!loading && !user) {
      // Store the intended destination
      sessionStorage.setItem('authRedirect', location.pathname);
      // Navigate to home with auth modal trigger
      navigate('/home?auth=true');
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

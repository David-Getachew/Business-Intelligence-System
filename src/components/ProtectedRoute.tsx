import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('admin' | 'staff')[];  // EXACT schema - admin not owner
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location]);

  useEffect(() => {
    if (!loading && user && profile && allowedRoles && !allowedRoles.includes(profile.role)) {
      // Staff users should be redirected to forms, not dashboard
      if (profile.role === 'staff') {
        navigate('/sales/quick', { replace: true });
        // Show access denied notification
        import('sonner').then(({ toast }) => {
          toast.error('Access Denied', {
            description: 'You do not have permission to view this page.',
            duration: 4000,
          });
        });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, loading, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}


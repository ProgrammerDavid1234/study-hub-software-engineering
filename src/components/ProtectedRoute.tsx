
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: ("student" | "teacher")[];
  redirectTo?: string;
};

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectTo = '/student/login'
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(redirectTo);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      navigate(user.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
    }
  }, [isAuthenticated, user, allowedRoles, navigate, redirectTo]);

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};

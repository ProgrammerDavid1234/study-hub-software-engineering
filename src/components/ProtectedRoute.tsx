
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
  // Skip all authentication checks - allow access to all protected routes
  return <>{children}</>;
};

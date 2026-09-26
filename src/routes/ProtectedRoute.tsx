import { Redirect, Route, type RouteProps } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

type ProtectedRouteProps = RouteProps & { allowedRoles?: UserRole[] };

export default function ProtectedRoute({ allowedRoles, ...routeProps }: ProtectedRouteProps) {
  const { user } = useAuth();
  const allowed = !!user && (!allowedRoles || allowedRoles.includes(user.role));

  if (!allowed) {
    return <Redirect to="/login" />;
  }

  return <Route {...routeProps} />;
}
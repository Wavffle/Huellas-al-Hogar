import { Redirect, Route, useLocation, type RouteProps } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext';

type ProtectedRouteProps = RouteProps & { allowedRoles?: UserRole[] };

export default function ProtectedRoute({ allowedRoles, ...routeProps }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();
  const allowed = !!user && (!allowedRoles || allowedRoles.includes(user.role));

  if (!allowed) {
    // Guarda de dónde venía, para volver ahí después de iniciar sesión
    return <Redirect to={{ pathname: '/login', state: { from: location } }} />;
  }

  return <Route {...routeProps} />;
}
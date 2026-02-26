import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function RoleRoute({ allowedRoles }) {
  const { role, active, loading } = useAuth();

  if (loading) return null;
  if (!active || !allowedRoles.includes(role)) return <Navigate to='/' replace />;

  return <Outlet />;
}

export default RoleRoute;

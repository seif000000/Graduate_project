import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHomeRoute } from '../utils/getHomeRoute';

/** Public pages (landing, login, register) — redirect logged-in users to their dashboard */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, role, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getHomeRoute(role, user?.is_verified)} replace />;
  }

  return children;
};

export default GuestRoute;

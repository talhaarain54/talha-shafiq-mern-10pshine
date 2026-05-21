import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading
      </div>
    );

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

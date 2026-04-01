import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { useAuth } from "../context/authContext";

interface Props {
  children: ReactNode;
}

const AdminRoute = ({ children }: Props) => {
  const { user, mainLoading } = useAuth();

  if (mainLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
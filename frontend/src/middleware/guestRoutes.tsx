import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";


interface GuestRouteProps {
  children: ReactNode;
}

function GuestRoute({ children }: GuestRouteProps) {
  const { accessToken } = useAuth();

  // if (mainLoading) {
  //   return (
  //     <MainLoading></MainLoading>
  //   )
  // }

  if (accessToken) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default GuestRoute;
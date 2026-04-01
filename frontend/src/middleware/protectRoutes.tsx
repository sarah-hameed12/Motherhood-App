import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
import MainLoading from "../components/MainLoading";


function ProtectedRoutes() {
  const { accessToken, mainLoading } = useAuth();

 if (mainLoading) {
    return <MainLoading />;
  }
 
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;

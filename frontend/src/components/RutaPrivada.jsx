import { Navigate, Outlet } from "react-router-dom";
import { esAdmin, isAuthenticated } from "../utils/session";

export default function RutaPrivada({ soloAdmin = false }) {
  if (!isAuthenticated()) return <Navigate to="/ingresar" replace />;
  if (soloAdmin && !esAdmin()) return <Navigate to="/ingresar" replace />;

  return <Outlet />;
}

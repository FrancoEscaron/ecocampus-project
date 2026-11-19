import { Outlet } from "react-router-dom";
import HeaderSimple from "./HeaderSimple";

export default function AuthLayout() {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <HeaderSimple />
      <Outlet />
    </>
  );
}

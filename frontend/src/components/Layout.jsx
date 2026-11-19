import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout() {
  const { pathname } = useLocation();
  const esAdmin = pathname === "/admin";
  const esPanel = pathname === "/panel";

  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      {!esAdmin && <Footer id={esPanel ? "contacto" : undefined} />}
    </>
  );
}

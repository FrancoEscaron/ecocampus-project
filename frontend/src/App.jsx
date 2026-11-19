import { Route, Routes } from "react-router-dom";
import AuthLayout from "./components/AuthLayout";
import ChatWidget from "./components/ChatWidget";
import Layout from "./components/Layout";
import RutaPrivada from "./components/RutaPrivada";
import ScrollToTop from "./components/ScrollToTop";
import Admin from "./pages/Admin";
import Certificado from "./pages/Certificado";
import Cursos from "./pages/Cursos";
import CursoDetalle from "./pages/CursoDetalle";
import Impacto from "./pages/Impacto";
import Ingresar from "./pages/Ingresar";
import Inicio from "./pages/Inicio";
import NoEncontrada from "./pages/NoEncontrada";
import Panel from "./pages/Panel";
import PreguntasFrecuentes from "./pages/PreguntasFrecuentes";
import Registro from "./pages/Registro";
import Validar from "./pages/Validar";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/cursos/:id" element={<CursoDetalle />} />
          <Route path="/validar" element={<Validar />} />
          <Route path="/impacto" element={<Impacto />} />
          <Route path="/faq" element={<PreguntasFrecuentes />} />
          <Route element={<RutaPrivada />}>
            <Route path="/panel" element={<Panel />} />
            <Route path="/panel/certificado/:courseId" element={<Certificado />} />
          </Route>
          <Route element={<RutaPrivada soloAdmin />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<NoEncontrada />} />
        </Route>
        <Route element={<AuthLayout />}>
          <Route path="/ingresar" element={<Ingresar />} />
          <Route path="/registro" element={<Registro />} />
        </Route>
      </Routes>
      <ChatWidget />
    </>
  );
}

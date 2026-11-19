import { Link } from "react-router-dom";
import useSeo from "../hooks/useSeo";

export default function NoEncontrada() {
  useSeo({
    titulo: "Página no encontrada | EcoCampus",
    descripcion: "La página que buscás no existe o cambió de dirección.",
    noindex: true,
  });

  return (
    <section className="section section-head">
      <h1 className="section-title">Página no encontrada</h1>
      <p className="section-description">La página que buscás no existe.</p>
      <Link to="/" className="button button-primary">
        Volver al inicio
      </Link>
    </section>
  );
}

import { Link } from "react-router-dom";

export default function NoEncontrada() {
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

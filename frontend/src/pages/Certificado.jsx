import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { obtenerCertificado } from "../api";
import { formatDate } from "../utils/format";

export default function Certificado() {
  const { courseId } = useParams();
  const [certificado, setCertificado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    obtenerCertificado(courseId)
      .then(({ respuesta, datos }) => {
        if (!activo) return;

        if (respuesta.ok && datos?.success) {
          setCertificado(datos.data);
        } else {
          setError(datos?.message || "No se pudo cargar el certificado.");
        }
      })
      .catch(() => {
        if (activo) {
          setError("No se pudo cargar el certificado. Intentá nuevamente.");
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [courseId]);

  if (cargando) {
    return (
      <section className="certificate-section">
        <p className="course-content-state">Cargando certificado...</p>
      </section>
    );
  }

  if (error || !certificado) {
    return (
      <section className="certificate-section">
        <div className="action-msg error" role="alert">
          {error || "Certificado no disponible."}
        </div>
        <Link className="certificate-back" to="/panel">
          Volver al panel
        </Link>
      </section>
    );
  }

  const fecha = formatDate(certificado.issuedAt, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="certificate-section">
      <div className="certificate-actions">
        <Link className="certificate-back" to="/panel">
          Volver al panel
        </Link>
        <button
          className="submit-btn certificate-print-btn"
          type="button"
          onClick={() => window.print()}
        >
          Imprimir o guardar como PDF
        </button>
      </div>

      <article className="certificate" aria-labelledby="certificate-title">
        <img
          className="certificate-logo"
          src="/assets/icons/EcoCampus.png"
          alt="EcoCampus"
        />
        <p className="certificate-eyebrow">EcoCampus</p>
        <h1 className="certificate-title" id="certificate-title">
          Certificado de finalización
        </h1>
        <p className="certificate-lead">Se certifica que</p>
        <p className="certificate-name">{certificado.studentName}</p>
        <p className="certificate-lead">completó el curso</p>
        <p className="certificate-course">{certificado.courseTitle}</p>
        {certificado.duration && (
          <p className="certificate-lead">Duración: {certificado.duration}</p>
        )}

        <div className="certificate-meta">
          <div>
            <span>Fecha de emisión</span>
            <strong>{fecha}</strong>
          </div>
          <div>
            <span>Código de verificación</span>
            <strong className="certificate-code">{certificado.code}</strong>
          </div>
        </div>

        <p className="certificate-note">
          Emitido por EcoCampus. Aprender mientras cambiás el mundo.
        </p>
      </article>
    </section>
  );
}

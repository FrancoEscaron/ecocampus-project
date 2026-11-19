import { useCallback, useState } from "react";
import {
  actualizarMensajeContacto,
  archivarAccion,
  archivarCurso,
  eliminarAccion,
  eliminarCurso,
  eliminarEnvio,
  eliminarFaq,
  eliminarMensajeContacto,
  obtenerAccionesAdmin,
  obtenerComprasAdmin,
  obtenerCursosAdmin,
  obtenerEnviosPendientes,
  obtenerFaqsAdmin,
  obtenerMensajesContacto,
  revisarEnvio,
} from "../api";
import AccionForm from "../components/admin/AccionForm";
import AdminCard from "../components/admin/AdminCard";
import CursoForm from "../components/admin/CursoForm";
import FaqForm from "../components/admin/FaqForm";
import MensajeAdmin from "../components/admin/MensajeAdmin";
import MensajesList from "../components/admin/MensajesList";
import PendientesList from "../components/admin/PendientesList";
import PurchasesTable from "../components/admin/PurchasesTable";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import useCarga from "../hooks/useCarga";
import useSeo from "../hooks/useSeo";
import { formatUnitRate, getActionUnit } from "../utils/actions";
import { getApiErrorMessage } from "../utils/apiError";
import {
  getCourseLevelLabel,
  getCoursePaymentLabelFromCosts,
  getModulesLabel,
} from "../utils/courses";
import { resolveAssetUrl } from "../utils/format";

const VISTAS = [
  { id: "cursos", texto: "Cursos" },
  { id: "acciones", texto: "Acciones" },
  { id: "entregas", texto: "Entregas" },
  { id: "pagos", texto: "Pagos" },
  { id: "mensajes", texto: "Mensajes" },
  { id: "faqs", texto: "Preguntas frecuentes" },
];

const CONFIRMACIONES = {
  curso: {
    titulo: "Eliminar curso",
    mensaje: "¿Estás seguro de eliminar este curso? Esta acción no se puede deshacer.",
  },
  accion: {
    titulo: "Eliminar acción",
    mensaje: "¿Estás seguro de eliminar esta acción? Esta acción no se puede deshacer.",
  },
  envio: {
    titulo: "Eliminar evidencia",
    mensaje: "¿Estás seguro de eliminar esta evidencia? Esta acción no se puede deshacer.",
  },
  faq: {
    titulo: "Eliminar pregunta frecuente",
    mensaje:
      "¿Estás seguro de eliminar esta pregunta frecuente? Esta acción no se puede deshacer.",
  },
};

export default function Admin() {
  const [vista, setVista] = useState("cursos");
  const [cursoEditando, setCursoEditando] = useState(null);
  const [accionEditando, setAccionEditando] = useState(null);
  const [faqEditando, setFaqEditando] = useState(null);
  const [formCursoAbierto, setFormCursoAbierto] = useState(false);
  const [formAccionAbierto, setFormAccionAbierto] = useState(false);
  const [formFaqAbierto, setFormFaqAbierto] = useState(false);
  const [versionCurso, setVersionCurso] = useState(0);
  const [versionAccion, setVersionAccion] = useState(0);
  const [versionFaq, setVersionFaq] = useState(0);

  useSeo({
    titulo: "Panel de administración | EcoCampus",
    descripcion: "Gestión de cursos, acciones, entregas y mensajes de EcoCampus.",
    ruta: "/admin",
    noindex: true,
  });
  const [avisos, setAvisos] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmacion, setConfirmacion] = useState(null);

  const cargaCursos = useCarga(obtenerCursosAdmin, "No se pudieron cargar los cursos.");
  const cargaAcciones = useCarga(
    obtenerAccionesAdmin,
    "No se pudieron cargar las acciones.",
  );
  const cargaPendientes = useCarga(
    obtenerEnviosPendientes,
    "No se pudieron cargar las evidencias.",
  );
  const cargaCompras = useCarga(obtenerComprasAdmin, "No se pudieron cargar las compras.");
  const cargaMensajes = useCarga(
    obtenerMensajesContacto,
    "No se pudieron cargar los mensajes de contacto.",
  );
  const cargaFaqs = useCarga(
    obtenerFaqsAdmin,
    "No se pudieron cargar las preguntas frecuentes.",
  );

  const cursos = Array.isArray(cargaCursos.datos) ? cargaCursos.datos : [];
  const acciones = Array.isArray(cargaAcciones.datos) ? cargaAcciones.datos : [];
  const pendientes = Array.isArray(cargaPendientes.datos) ? cargaPendientes.datos : [];
  const compras = Array.isArray(cargaCompras.datos) ? cargaCompras.datos : [];
  const mensajes = Array.isArray(cargaMensajes.datos) ? cargaMensajes.datos : [];
  const mensajesNuevos = mensajes.filter((mensaje) => !mensaje.read).length;
  const faqs = Array.isArray(cargaFaqs.datos) ? cargaFaqs.datos : [];

  const claseVista = (id) => (vista === id ? "admin-view-content active" : "admin-view-content");
  const avisar = (clave, texto, tipo = "success") =>
    setAvisos((anteriores) => ({ ...anteriores, [clave]: { texto, tipo } }));
  const avisarError = (clave, datos, fallback = "No se pudo completar la acción.") =>
    avisar(clave, getApiErrorMessage(datos, fallback), "error");
  const limpiarAviso = (clave) =>
    setAvisos((anteriores) => {
      if (!anteriores[clave]) return anteriores;
      const copia = { ...anteriores };
      delete copia[clave];
      return copia;
    });
  const mensajeDe = (clave, mensajeCarga) =>
    avisos[clave] || (mensajeCarga ? { texto: mensajeCarga, tipo: "error", fijo: true } : null);
  const cerrarToast = useCallback(() => setToast(null), []);
  const mostrarToast = (texto, tipo = "success") => setToast({ texto, tipo });
  const abrirConfirmacion = (tipo, id) => setConfirmacion({ tipo, id });
  const cerrarConfirmacion = () => setConfirmacion(null);

  const cambiarLeidoMensaje = async (id, read) => {
    try {
      const { datos } = await actualizarMensajeContacto(id, read);

      if (datos?.success) {
        mostrarToast(datos.message || "Mensaje actualizado.");
        cargaMensajes.recargar();
      } else {
        mostrarToast(
          getApiErrorMessage(datos, "No se pudo actualizar el mensaje."),
          "error",
        );
      }
    } catch {
      mostrarToast("No se pudo actualizar el mensaje.", "error");
    }
  };

  const borrarMensaje = async (id) => {
    try {
      const { datos } = await eliminarMensajeContacto(id);

      if (datos?.success) {
        mostrarToast(datos.message || "Mensaje eliminado.");
        cargaMensajes.recargar();
      } else {
        mostrarToast(getApiErrorMessage(datos, "No se pudo eliminar el mensaje."), "error");
      }
    } catch {
      mostrarToast("No se pudo eliminar el mensaje.", "error");
    }
  };

  const abrirCrearCurso = () => {
    setCursoEditando(null);
    setVersionCurso((valor) => valor + 1);
    setFormCursoAbierto(true);
  };

  const abrirEditarCurso = (curso) => {
    setCursoEditando(curso);
    setVersionCurso((valor) => valor + 1);
    setFormCursoAbierto(true);
  };

  const cerrarCurso = () => {
    setFormCursoAbierto(false);
    setCursoEditando(null);
  };

  const guardadoCurso = (mensaje) => {
    avisar("cursos", mensaje || "Curso guardado.");
    cerrarCurso();
    cargaCursos.recargar();
  };

  const alternarArchivoCurso = async (curso) => {
    try {
      const { datos } = await archivarCurso(curso._id);

      if (datos?.success) {
        avisar("cursos", datos.message || "Curso actualizado.");
        cargaCursos.recargar();
      } else {
        avisarError("cursos", datos);
      }
    } catch {
      avisar("cursos", "No se pudo actualizar el curso.", "error");
    }
  };

  const borrarCurso = async (id) => {
    try {
      const { datos } = await eliminarCurso(id);

      if (datos?.success) {
        avisar("cursos", datos.message || "Curso eliminado.");
        cargaCursos.recargar();
      } else {
        avisarError("cursos", datos);
      }
    } catch {
      avisar("cursos", "No se pudo eliminar el curso.", "error");
    }
  };

  const abrirCrearAccion = () => {
    setAccionEditando(null);
    setVersionAccion((valor) => valor + 1);
    setFormAccionAbierto(true);
  };

  const abrirEditarAccion = (accion) => {
    setAccionEditando(accion);
    setVersionAccion((valor) => valor + 1);
    setFormAccionAbierto(true);
  };

  const cerrarAccion = () => {
    setFormAccionAbierto(false);
    setAccionEditando(null);
  };

  const guardadoAccion = (mensaje) => {
    avisar("acciones", mensaje || "Acción guardada.");
    cerrarAccion();
    cargaAcciones.recargar();
  };

  const alternarArchivoAccion = async (accion) => {
    try {
      const { datos } = await archivarAccion(accion._id);

      if (datos?.success) {
        avisar("acciones", datos.message || "Acción actualizada.");
        cargaAcciones.recargar();
      } else {
        avisarError("acciones", datos);
      }
    } catch {
      avisar("acciones", "No se pudo actualizar la acción.", "error");
    }
  };

  const borrarAccion = async (id) => {
    try {
      const { datos } = await eliminarAccion(id);

      if (datos?.success) {
        avisar("acciones", datos.message || "Acción eliminada.");
        cargaAcciones.recargar();
      } else {
        avisarError("acciones", datos);
      }
    } catch {
      avisar("acciones", "No se pudo eliminar la acción.", "error");
    }
  };

  const revisar = async (id, status, motivo = "") => {
    try {
      const { datos } = await revisarEnvio(id, status, motivo);

      if (datos?.success) {
        avisar("entregas", datos.message || "Evidencia revisada.");
        cargaPendientes.recargar();
      } else {
        avisarError("entregas", datos);
      }
    } catch {
      avisar("entregas", "No se pudo revisar la evidencia.", "error");
    }
  };

  const aprobarEnvio = (id) => revisar(id, "approved");

  const rechazarEnvio = (id, motivo) => revisar(id, "rejected", motivo);

  const borrarEnvio = async (id) => {
    try {
      const { datos } = await eliminarEnvio(id);

      if (datos?.success) {
        avisar("entregas", datos.message || "Evidencia eliminada.");
        cargaPendientes.recargar();
      } else {
        avisarError("entregas", datos);
      }
    } catch {
      avisar("entregas", "No se pudo eliminar la evidencia.", "error");
    }
  };

  const abrirCrearFaq = () => {
    setFaqEditando(null);
    setVersionFaq((valor) => valor + 1);
    setFormFaqAbierto(true);
  };

  const abrirEditarFaq = (faq) => {
    setFaqEditando(faq);
    setVersionFaq((valor) => valor + 1);
    setFormFaqAbierto(true);
  };

  const cerrarFaq = () => {
    setFormFaqAbierto(false);
    setFaqEditando(null);
  };

  const guardadoFaq = (mensaje) => {
    avisar("faqs", mensaje || "Pregunta guardada.");
    cerrarFaq();
    cargaFaqs.recargar();
  };

  const borrarFaq = async (id) => {
    try {
      const { datos } = await eliminarFaq(id);

      if (datos?.success) {
        avisar("faqs", datos.message || "Pregunta eliminada.");
        cargaFaqs.recargar();
      } else {
        avisarError("faqs", datos);
      }
    } catch {
      avisar("faqs", "No se pudo eliminar la pregunta.", "error");
    }
  };

  const confirmarEliminacion = () => {
    if (!confirmacion) return;

    const { tipo, id } = confirmacion;
    cerrarConfirmacion();

    if (tipo === "curso") borrarCurso(id);
    if (tipo === "accion") borrarAccion(id);
    if (tipo === "envio") borrarEnvio(id);
    if (tipo === "faq") borrarFaq(id);
  };

  return (
    <div className="section">
      <div className="admin-wrapper">
        <div className="section-head">
          <h1 className="section-title">Panel de administración</h1>
          <p className="section-description">
            Gestioná cursos, acciones sustentables, entregas de fotos, pagos y mensajes.
          </p>
        </div>

        <div className="admin-tabs">
          {VISTAS.map(({ id, texto }) => (
            <button
              key={id}
              className={vista === id ? "admin-tab-btn active" : "admin-tab-btn"}
              type="button"
              onClick={() => setVista(id)}
            >
              {texto}
              {id === "mensajes" && mensajesNuevos > 0 && (
                <span className="admin-tab-badge">{mensajesNuevos}</span>
              )}
            </button>
          ))}
        </div>

        <section id="view-courses" className={claseVista("cursos")}>
          <div className="admin-header-flex">
            <div>
              <h2 className="admin-title">Cursos</h2>
              <p className="admin-desc">
                Creá, editá, archivá y eliminá cursos. También podés subir la imagen de cada
                curso.
              </p>
            </div>
            <button
              id="open-create-course-btn"
              className="admin-btn-create"
              type="button"
              onClick={abrirCrearCurso}
            >
              + Crear curso
            </button>
          </div>

          <div id="courses-feedback" aria-live="polite">
            <MensajeAdmin
              mensaje={mensajeDe("cursos", cargaCursos.error)}
              onOcultar={() => limpiarAviso("cursos")}
            />
          </div>

          <CursoForm
            key={`${cursoEditando?._id || "nuevo"}-${versionCurso}`}
            abierto={formCursoAbierto}
            curso={cursoEditando}
            onCerrar={cerrarCurso}
            onGuardado={guardadoCurso}
          />

          <div className="admin-section">
            <h2 className="admin-subtitle">Cursos cargados</h2>
            <div id="courses-admin-container" className="admin-items-list">
              {cargaCursos.cargando || cargaCursos.error ? null : cursos.length === 0 ? (
                <p className="admin-empty">Todavía no hay cursos.</p>
              ) : (
                cursos.map((curso) => (
                  <AdminCard
                    key={curso._id}
                    imageUrl={resolveAssetUrl(curso.image, null)}
                    title={curso.title}
                    meta={`${curso.duration} · ${getModulesLabel(curso.modulesCount)} · ${getCourseLevelLabel(
                      curso.level,
                    )}`}
                    price={`${curso.pointsCost ?? 0} Eco-Points · ${curso.price ?? 0} ${
                      curso.currency || "UYU"
                    } · ${getCoursePaymentLabelFromCosts(curso.pointsCost, curso.price)}`}
                    description={curso.description}
                    badge={curso.archived ? { className: "archived", text: "Archivado" } : null}
                    acciones={[
                      {
                        label: "Editar",
                        className: "admin-btn-neutral",
                        onClick: () => abrirEditarCurso(curso),
                      },
                      {
                        label: curso.archived ? "Reactivar" : "Archivar",
                        className: "admin-btn-neutral",
                        onClick: () => alternarArchivoCurso(curso),
                      },
                      {
                        label: "Eliminar",
                        className: "admin-btn-delete",
                        onClick: () => abrirConfirmacion("curso", curso._id),
                      },
                    ]}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <section id="view-actions" className={claseVista("acciones")}>
          <div className="admin-header-flex">
            <div>
              <h2 className="admin-title">Acciones sustentables</h2>
              <p className="admin-desc">
                Creá, editá, archivá y eliminá las acciones que los usuarios pueden validar.
              </p>
            </div>
            <button
              id="open-create-action-btn"
              className="admin-btn-create"
              type="button"
              onClick={abrirCrearAccion}
            >
              + Crear acción
            </button>
          </div>

          <div id="actions-feedback" aria-live="polite">
            <MensajeAdmin
              mensaje={mensajeDe("acciones", cargaAcciones.error)}
              onOcultar={() => limpiarAviso("acciones")}
            />
          </div>

          <AccionForm
            key={`${accionEditando?._id || "nuevo"}-${versionAccion}`}
            abierto={formAccionAbierto}
            accion={accionEditando}
            onCerrar={cerrarAccion}
            onGuardado={guardadoAccion}
          />

          <div className="admin-section">
            <h2 className="admin-subtitle">Acciones cargadas</h2>
            <div id="actions-admin-container" className="admin-items-list">
              {cargaAcciones.cargando || cargaAcciones.error ? null : acciones.length === 0 ? (
                <p className="admin-empty">Todavía no hay acciones cargadas.</p>
              ) : (
                acciones.map((accion) => (
                  <AdminCard
                    key={accion._id}
                    imageUrl={resolveAssetUrl(accion.image, null)}
                    title={accion.title}
                    meta={`Clave: ${accion.key} · ${
                      accion.pointsPerUnit
                    } Eco-Points por ${formatUnitRate(
                      accion.unit || getActionUnit(accion.impactMetric),
                    )} · Orden: ${accion.order}`}
                    description={accion.description}
                    badge={
                      accion.archived ? { className: "archived", text: "Archivada" } : null
                    }
                    acciones={[
                      {
                        label: "Editar",
                        className: "admin-btn-neutral",
                        onClick: () => abrirEditarAccion(accion),
                      },
                      {
                        label: accion.archived ? "Reactivar" : "Archivar",
                        className: "admin-btn-neutral",
                        onClick: () => alternarArchivoAccion(accion),
                      },
                      {
                        label: "Eliminar",
                        className: "admin-btn-delete",
                        disabled: accion.submissionCount > 0,
                        title:
                          accion.submissionCount > 0
                            ? "Tiene envíos asociados. Archivala para ocultarla."
                            : "",
                        onClick: () => abrirConfirmacion("accion", accion._id),
                      },
                    ]}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        <section id="view-deliveries" className={claseVista("entregas")}>
          <h2 className="admin-title">Validar Evidencias de Usuarios</h2>
          <div id="action-feedback" aria-live="polite">
            <MensajeAdmin
              mensaje={mensajeDe("entregas", cargaPendientes.error)}
              onOcultar={() => limpiarAviso("entregas")}
            />
          </div>
          <div id="pending-actions-container" className="admin-section">
            {cargaPendientes.cargando || cargaPendientes.error ? null : pendientes.length ===
              0 ? (
              <p className="admin-empty">No hay evidencias de acciones pendientes.</p>
            ) : (
              <PendientesList
                pendientes={pendientes}
                onAprobar={aprobarEnvio}
                onRechazar={rechazarEnvio}
                onEliminar={(id) => abrirConfirmacion("envio", id)}
              />
            )}
          </div>
        </section>

        <section id="view-payments" className={claseVista("pagos")}>
          <h2 className="admin-title">Reporte de Pagos y Compras</h2>
          <div id="purchases-feedback" aria-live="polite">
            <MensajeAdmin
              mensaje={mensajeDe("pagos", cargaCompras.error)}
              onOcultar={() => limpiarAviso("pagos")}
            />
          </div>
          <div id="purchases-container" className="admin-section admin-table-wrapper">
            {cargaCompras.cargando || cargaCompras.error ? null : compras.length === 0 ? (
              <p className="admin-empty">No hay compras registradas.</p>
            ) : (
              <PurchasesTable usuarios={compras} />
            )}
          </div>
        </section>

        <section id="view-messages" className={claseVista("mensajes")}>
          <div className="admin-header-flex">
            <div>
              <h2 className="admin-title">Mensajes de contacto</h2>
              <p className="admin-desc">
                Leé los mensajes enviados desde el formulario de contacto y marcalos como
                leídos.
              </p>
            </div>
          </div>

          <div id="contact-feedback" aria-live="polite">
            <MensajeAdmin
              mensaje={mensajeDe("mensajes", cargaMensajes.error)}
              onOcultar={() => limpiarAviso("mensajes")}
            />
          </div>

          <div id="contact-messages-container" className="admin-section admin-items-list">
            {cargaMensajes.cargando || cargaMensajes.error ? null : mensajes.length === 0 ? (
              <p className="admin-empty">No hay mensajes de contacto.</p>
            ) : (
              <MensajesList
                mensajes={mensajes}
                onMarcarLeido={cambiarLeidoMensaje}
                onEliminar={borrarMensaje}
              />
            )}
          </div>
        </section>

        <section id="view-faqs" className={claseVista("faqs")}>
          <div className="admin-header-flex">
            <div>
              <h2 className="admin-title">Preguntas frecuentes</h2>
              <p className="admin-desc">Agregá, editá o eliminá las preguntas y respuestas.</p>
            </div>
            <button
              id="open-create-faq-btn"
              className="admin-btn-create"
              type="button"
              onClick={abrirCrearFaq}
            >
              + Crear pregunta
            </button>
          </div>

          <div id="faqs-feedback" aria-live="polite">
            <MensajeAdmin
              mensaje={mensajeDe("faqs", cargaFaqs.error)}
              onOcultar={() => limpiarAviso("faqs")}
            />
          </div>

          <FaqForm
            key={`${faqEditando?._id || "nuevo"}-${versionFaq}`}
            abierto={formFaqAbierto}
            faq={faqEditando}
            onCerrar={cerrarFaq}
            onGuardado={guardadoFaq}
          />

          <div className="admin-section">
            <h2 className="admin-subtitle">Preguntas cargadas</h2>
            <div id="faqs-admin-container" className="admin-items-list">
              {cargaFaqs.cargando || cargaFaqs.error ? null : faqs.length === 0 ? (
                <p className="admin-empty">No hay preguntas frecuentes cargadas.</p>
              ) : (
                faqs.map((faq) => (
                  <AdminCard
                    key={faq._id}
                    title={faq.question}
                    description={faq.answer}
                    acciones={[
                      {
                        label: "Editar",
                        className: "admin-btn-neutral",
                        onClick: () => abrirEditarFaq(faq),
                      },
                      {
                        label: "Eliminar",
                        className: "admin-btn-delete",
                        onClick: () => abrirConfirmacion("faq", faq._id),
                      },
                    ]}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </div>
      {confirmacion && (
        <ConfirmDialog
          titulo={CONFIRMACIONES[confirmacion.tipo].titulo}
          mensaje={CONFIRMACIONES[confirmacion.tipo].mensaje}
          onConfirmar={confirmarEliminacion}
          onCerrar={cerrarConfirmacion}
        />
      )}
      <Toast mensaje={toast?.texto} tipo={toast?.tipo} onCerrar={cerrarToast} />
    </div>
  );
}

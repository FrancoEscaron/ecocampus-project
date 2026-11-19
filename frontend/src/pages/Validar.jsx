import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { obtenerCatalogoAcciones, obtenerMisEnvios } from "../api";
import ActionCard from "../components/ActionCard";
import ContactSection from "../components/ContactSection";
import EvidenceModal from "../components/EvidenceModal";
import SubmissionItem from "../components/SubmissionItem";
import useAhora from "../hooks/useAhora";
import useCarga from "../hooks/useCarga";
import useSeo from "../hooks/useSeo";
import { formatWait, getCooldownEnd } from "../utils/actions";
import { isAuthenticated } from "../utils/session";

export default function Validar() {
  const logueado = isAuthenticated();
  const navigate = useNavigate();
  const location = useLocation();
  const [accionAbierta, setAccionAbierta] = useState(null);
  const [accionPendiente, setAccionPendiente] = useState(
    () => location.state?.accionKey || null,
  );

  useSeo({
    titulo: "Valida tus acciones | EcoCampus",
    descripcion:
      "Subí evidencias de tus acciones sustentables, sumá Eco-Points y canjealos por cursos en EcoCampus.",
    ruta: "/validar",
  });

  const cargaCatalogo = useCarga(
    obtenerCatalogoAcciones,
    "No se pudieron cargar las acciones. Intentá nuevamente más tarde.",
  );
  const cargaEnvios = useCarga(
    obtenerMisEnvios,
    "No se pudieron cargar tus envíos.",
    logueado,
  );

  const acciones = useMemo(
    () => (Array.isArray(cargaCatalogo.datos) ? cargaCatalogo.datos : []),
    [cargaCatalogo.datos],
  );
  const envios = useMemo(
    () => (Array.isArray(cargaEnvios.datos) ? cargaEnvios.datos : []),
    [cargaEnvios.datos],
  );

  const resumenPorAccion = useMemo(() => {
    const mapa = new Map();

    envios.forEach((envio) => {
      if (!envio.actionKey) return;

      const resumen = mapa.get(envio.actionKey) || { pendiente: null, aprobado: null };

      if (envio.status === "pending") {
        resumen.pendiente = envio;
      }

      if (envio.status === "approved") {
        const anterior = resumen.aprobado;
        const fecha = new Date(envio.reviewedAt || envio.submittedAt || 0);
        const fechaAnterior = anterior
          ? new Date(anterior.reviewedAt || anterior.submittedAt || 0)
          : null;

        if (!fechaAnterior || fecha > fechaAnterior) {
          resumen.aprobado = envio;
        }
      }

      mapa.set(envio.actionKey, resumen);
    });

    return mapa;
  }, [envios]);

  const ahora = useAhora();

  const accionPendienteDatos = useMemo(() => {
    if (!accionPendiente || cargaCatalogo.cargando) return null;
    return acciones.find((accion) => accion.key === accionPendiente) || null;
  }, [accionPendiente, cargaCatalogo.cargando, acciones]);

  const accionMostrada = accionAbierta || (logueado ? accionPendienteDatos : null);

  const cerrarEvidencia = () => {
    setAccionAbierta(null);
    setAccionPendiente(null);
    navigate("/validar", { replace: true });
  };

  const estadoBoton = (accion) => {
    const resumen = resumenPorAccion.get(accion.key);

    if (resumen?.pendiente) {
      return { texto: "Pendiente de revisión", deshabilitado: true };
    }

    const finEspera = getCooldownEnd(accion, resumen?.aprobado);

    if (finEspera && finEspera.getTime() > ahora) {
      return {
        texto: `Disponible en ${formatWait(finEspera, ahora)}`,
        deshabilitado: true,
      };
    }

    if (resumen) {
      return { texto: "Volver a enviar", deshabilitado: false };
    }

    return { texto: "Subir evidencia", deshabilitado: false };
  };

  const abrirEvidencia = (accion) => {
    if (!logueado) {
      navigate("/ingresar", {
        state: { from: "/validar", accionKey: accion.key },
      });
      return;
    }

    setAccionAbierta(accion);
  };

  let tarjetas = null;

  if (cargaCatalogo.error) {
    tarjetas = <p className="public-empty">{cargaCatalogo.error}</p>;
  } else if (!cargaCatalogo.cargando) {
    tarjetas =
      acciones.length === 0 ? (
        <p className="public-empty">Todavía no hay acciones disponibles.</p>
      ) : (
        acciones.map((accion) => {
          const estado = estadoBoton(accion);

          return (
            <ActionCard
              key={accion._id}
              accion={accion}
              textoBoton={estado.texto}
              deshabilitado={estado.deshabilitado}
              onSubir={() => abrirEvidencia(accion)}
            />
          );
        })
      );
  }

  let listaEnvios = null;

  if (!logueado) {
    listaEnvios = <p className="my-submissions-empty">Iniciá sesión para ver tus envíos.</p>;
  } else if (cargaEnvios.error) {
    listaEnvios = <p className="my-submissions-empty">{cargaEnvios.error}</p>;
  } else if (!cargaEnvios.cargando) {
    listaEnvios =
      envios.length === 0 ? (
        <p className="my-submissions-empty">Todavía no enviaste evidencias.</p>
      ) : (
        envios.map((envio) => <SubmissionItem key={envio._id} envio={envio} />)
      );
  }

  return (
    <>
      <section className="section-validate" id="validate">
        <div className="validate-head">
          <h1 className="validate-title">Valida tus acciones</h1>
          <p className="validate-description">¡Conviértelas en puntos para acceder a cursos!</p>
        </div>

        <div className="cards-val-grid" id="actions-grid">
          {tarjetas}
        </div>

        <div className="my-submissions" id="mis-envios">
          <div className="my-submissions-head">
            <h2 className="my-submissions-title">Mis envíos</h2>
            <p className="my-submissions-desc">Revisá el estado de las evidencias que enviaste.</p>
          </div>
          <div id="my-submissions-container" className="my-submissions-list">
            {listaEnvios}
          </div>
        </div>
      </section>

      {accionMostrada && (
        <EvidenceModal
          accion={accionMostrada}
          onCerrar={cerrarEvidencia}
          onEnviado={cargaEnvios.recargar}
        />
      )}

      <ContactSection />
    </>
  );
}

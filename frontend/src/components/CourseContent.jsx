import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  actualizarProgresoModulo,
  comprarCurso,
  obtenerContenidoCurso,
} from "../api";
import { getApiErrorMessage } from "../utils/apiError";
import { getModulesLabel, getOwnedCourseIds } from "../utils/courses";
import { formatMoney, roundMoney, safeExternalUrl } from "../utils/format";
import { updateUser } from "../utils/session";
import ModuleVideo from "./ModuleVideo";

export default function CourseContent({ curso, usuario, onActualizar }) {
  const [puntosSeleccionados, setPuntosSeleccionados] = useState(() => {
    const puntos = Math.max(0, Math.floor(Number(curso?.pointsCost) || 0));
    const disponibles = Math.max(0, Math.floor(Number(usuario?.ecoPoints) || 0));
    return Math.min(puntos, disponibles);
  });
  const [aviso, setAviso] = useState({ texto: "", tipo: "" });
  const [avisoModulo, setAvisoModulo] = useState({ texto: "", tipo: "" });
  const [enviando, setEnviando] = useState(false);
  const [contenido, setContenido] = useState(null);
  const [errorContenido, setErrorContenido] = useState("");
  const [guardandoModulo, setGuardandoModulo] = useState("");
  const [accesoLocal, setAccesoLocal] = useState(false);

  const cursoId = curso?._id;
  const usuarioId = usuario?.id;
  const hasAccess =
    Boolean(curso && usuario) &&
    (accesoLocal ||
      usuario.role === "admin" ||
      getOwnedCourseIds(usuario).includes(String(curso._id)));

  useEffect(() => {
    if (!cursoId || !usuarioId || !hasAccess) return undefined;

    let activo = true;

    obtenerContenidoCurso(cursoId)
      .then(({ respuesta, datos }) => {
        if (!activo) return;

        if (respuesta.ok && datos?.success) {
          setContenido(datos.data);
        } else {
          setErrorContenido(
            getApiErrorMessage(datos, "No se pudo cargar el contenido del curso."),
          );
        }
      })
      .catch(() => {
        if (activo) {
          setErrorContenido("No se pudo cargar el contenido del curso.");
        }
      });

    return () => {
      activo = false;
    };
  }, [cursoId, usuarioId, hasAccess]);

  const cargandoContenido = hasAccess && !contenido && !errorContenido;

  const modulos = Array.isArray(contenido?.modules) ? contenido.modules : [];
  const completados = useMemo(
    () => new Set(contenido?.completedModules || []),
    [contenido],
  );
  const modulosCompletados = modulos.filter((modulo) =>
    completados.has(modulo._id),
  ).length;
  const porcentaje =
    modulos.length > 0
      ? Math.round((modulosCompletados / modulos.length) * 100)
      : 0;
  const completo = modulos.length > 0 && modulosCompletados === modulos.length;

  if (!curso || !usuario) return null;

  const puntosCost = Math.max(0, Math.floor(Number(curso.pointsCost) || 0));
  const price = Math.max(0, Number(curso.price) || 0);
  const currency = curso.currency || "UYU";
  const availablePoints = Math.max(0, Math.floor(Number(usuario.ecoPoints) || 0));
  const isMixed = puntosCost > 0 && price > 0;
  const isPointsOnly = puntosCost > 0 && price === 0;
  const isMoneyOnly = puntosCost === 0 && price > 0;
  const isFree = puntosCost === 0 && price === 0;
  const hasEnoughPoints = availablePoints >= puntosCost;
  const maxPoints = Math.min(puntosCost, availablePoints);
  const videoUrl = safeExternalUrl(contenido?.videoUrl || curso.videoUrl);
  const pdfUrl = safeExternalUrl(contenido?.pdfUrl || curso.pdfUrl);
  const calcMoney = (puntos) =>
    puntosCost > 0 ? roundMoney(price * (1 - puntos / puntosCost)) : roundMoney(price);
  const moneyLabel = isMixed ? formatMoney(calcMoney(puntosSeleccionados), currency) : "";

  const confirmar = async () => {
    const pointsUsed = isMixed ? puntosSeleccionados : isPointsOnly ? puntosCost : 0;

    setEnviando(true);
    setAviso({ texto: "", tipo: "" });

    try {
      const { respuesta, datos } = await comprarCurso({
        courseId: curso._id,
        pointsUsed,
      });

      if (respuesta.status === 401) {
        setAviso({
          texto: "Tu sesión venció. Iniciá sesión nuevamente.",
          tipo: "error",
        });
        return;
      }

      if (datos?.success) {
        const payload = datos.data || {};
        updateUser({
          coursesOwned: payload.coursesOwned,
          ecoPoints: payload.ecoPoints,
        });
        setAccesoLocal(true);
        if (onActualizar) onActualizar();
        setAviso({
          texto: datos.message || "Curso desbloqueado con éxito.",
          tipo: "success",
        });
      } else {
        setAviso({
          texto: getApiErrorMessage(datos, "No se pudo completar el pago."),
          tipo: "error",
        });
      }
    } catch {
      setAviso({
        texto: "No se pudo completar el pago. Intentá nuevamente.",
        tipo: "error",
      });
    } finally {
      setEnviando(false);
    }
  };

  const alternarModulo = async (modulo, completado) => {
    setGuardandoModulo(modulo._id);
    setAvisoModulo({ texto: "", tipo: "" });

    try {
      const { datos } = await actualizarProgresoModulo(
        curso._id,
        modulo._id,
        completado,
      );

      if (datos?.success) {
        const siguientes = datos.data?.completedModules || [];
        const idsValidos = new Set(modulos.map((item) => item._id));
        const completadosSiguientes = siguientes.filter((id) =>
          idsValidos.has(id),
        ).length;
        const siguienteCompleto =
          modulos.length > 0 && completadosSiguientes === modulos.length;

        setContenido((anterior) => ({
          ...anterior,
          completedModules: siguientes,
        }));

        if (onActualizar && siguienteCompleto !== completo) onActualizar();
      } else {
        setAvisoModulo({
          texto: getApiErrorMessage(datos, "No se pudo guardar tu progreso."),
          tipo: "error",
        });
      }
    } catch {
      setAvisoModulo({
        texto: "No se pudo guardar tu progreso. Intentá nuevamente.",
        tipo: "error",
      });
    } finally {
      setGuardandoModulo("");
    }
  };

  return (
    <div className="course-content-panel">
      {aviso.texto && (
        <div
          className={`action-msg ${aviso.tipo}`}
          role={aviso.tipo === "error" ? "alert" : "status"}
        >
          {aviso.texto}
        </div>
      )}

      {hasAccess ? (
        <>
          <p>
            <strong>¡Tienes acceso autorizado!</strong>
          </p>
          {cargandoContenido && (
            <p className="course-content-state">Cargando contenido...</p>
          )}
          {errorContenido && (
            <div className="action-msg error" role="alert">
              {errorContenido}
            </div>
          )}
          {contenido && (
            <>
              <div className="course-progress">
                <div className="course-progress-head">
                  <span>Tu progreso</span>
                  <strong>
                    {modulosCompletados} de {getModulesLabel(modulos.length)} · {porcentaje}%
                  </strong>
                </div>
                <div
                  className="course-progress-bar"
                  role="progressbar"
                  aria-valuemin="0"
                  aria-valuemax={modulos.length}
                  aria-valuenow={modulosCompletados}
                  aria-valuetext={`${modulosCompletados} de ${modulos.length} ${modulos.length === 1 ? "módulo completado" : "módulos completados"}`}
                >
                  <span
                    className="course-progress-fill"
                    style={{ width: `${porcentaje}%` }}
                  ></span>
                </div>
              </div>

              {completo && (
                <div className="course-completed-banner" role="status">
                  <p>¡Completaste todos los módulos de este curso!</p>
                  <Link
                    to={`/panel/certificado/${curso._id}`}
                    className="course-completed-link"
                  >
                    Ver mi certificado
                  </Link>
                </div>
              )}

              {modulos.length === 0 ? (
                <div className="course-secret-content-box">
                  {contenido.contentDetails ||
                    curso.contentDetails ||
                    "Este curso todavía no tiene módulos cargados."}
                </div>
              ) : (
                <ul className="course-module-list">
                  {modulos.map((modulo, indice) => {
                    const completado = completados.has(modulo._id);
                    const moduleVideoUrl = safeExternalUrl(modulo.videoUrl);
                    const modulePdfUrl = safeExternalUrl(modulo.pdfUrl);

                    return (
                      <li
                        key={modulo._id}
                        className={
                          completado
                            ? "course-module-item is-completed"
                            : "course-module-item"
                        }
                      >
                        <div className="course-module-head">
                          <span className="course-module-number">{indice + 1}</span>
                          <h3 className="course-module-title">{modulo.title}</h3>
                        </div>
                        {modulo.description && (
                          <p className="course-module-description">
                            {modulo.description}
                          </p>
                        )}
                        {moduleVideoUrl && (
                          <ModuleVideo url={moduleVideoUrl} title={modulo.title} />
                        )}
                        {modulePdfUrl && (
                          <div className="course-module-resources">
                            <a
                              href={modulePdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Descargar PDF del módulo
                            </a>
                          </div>
                        )}
                        <button
                          type="button"
                          className={
                            completado
                              ? "course-module-toggle is-completed"
                              : "course-module-toggle"
                          }
                          aria-pressed={completado}
                          disabled={guardandoModulo === modulo._id}
                          onClick={() => alternarModulo(modulo, !completado)}
                        >
                          {guardandoModulo === modulo._id
                            ? "Guardando..."
                            : completado
                              ? "Desmarcar módulo"
                              : "Marcar como completado"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {avisoModulo.texto && (
                <div
                  className={`action-msg ${avisoModulo.tipo}`}
                  role={avisoModulo.tipo === "error" ? "alert" : "status"}
                >
                  {avisoModulo.texto}
                </div>
              )}

              {(videoUrl || pdfUrl) && (
                <div className="course-modal-resources">
                  <span className="course-modal-resources-title">
                    Recursos generales del curso
                  </span>
                  {videoUrl && (
                    <ModuleVideo url={videoUrl} title={`Video general de ${curso.title}`} />
                  )}
                  {pdfUrl && (
                    <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                      Descargar PDF general
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {isFree && (
            <p>
              Este curso es gratuito. Desbloquealo para acceder al contenido completo.
            </p>
          )}

          {isMixed && (
            <>
              <p>
                Elegí cuántos Eco-Points querés usar. El resto se completa con dinero
                simulado.
              </p>
              <div className="course-payment-simulator">
                <div className="course-payment-balance">
                  <span>Saldo disponible</span>
                  <strong>{availablePoints} Eco-Points</strong>
                </div>
                {maxPoints > 0 ? (
                  <>
                    <label className="course-payment-label" htmlFor="course-points-range">
                      Eco-Points a usar
                    </label>
                    <input
                      className="course-payment-range"
                      id="course-points-range"
                      type="range"
                      min="0"
                      max={maxPoints}
                      step="1"
                      value={puntosSeleccionados}
                      aria-describedby="course-payment-summary"
                      aria-valuetext={`${puntosSeleccionados} Eco-Points y ${moneyLabel} simulados`}
                      onChange={(evento) =>
                        setPuntosSeleccionados(Number(evento.target.value) || 0)
                      }
                    />
                  </>
                ) : (
                  <p className="course-payment-warning">
                    No tenés Eco-Points disponibles. Vas a pagar el total con dinero
                    simulado.
                  </p>
                )}
                <div
                  className="course-payment-breakdown"
                  id="course-payment-summary"
                  aria-live="polite"
                >
                  <p>
                    <span>Eco-Points:</span> <strong>{puntosSeleccionados}</strong>
                  </p>
                  <p>
                    <span>Dinero simulado:</span> <strong>{moneyLabel}</strong>
                  </p>
                </div>
                <p className="course-payment-note">
                  Pago simulado: no se realiza ningún cobro real.
                </p>
              </div>
            </>
          )}

          {isMoneyOnly && (
            <>
              <p>Este curso se paga únicamente con dinero.</p>
              <div className="course-payment-simulator">
                <div className="course-payment-breakdown">
                  <p>
                    <span>Dinero a pagar:</span>{" "}
                    <strong>{formatMoney(price, currency)}</strong>
                  </p>
                </div>
                <p className="course-payment-note">
                  Pago simulado: no se realiza ningún cobro real.
                </p>
              </div>
            </>
          )}

          {isPointsOnly && (
            <>
              <p>Este curso se desbloquea con Eco-Points.</p>
              <div className="course-payment-simulator">
                <div className="course-payment-breakdown">
                  <p>
                    <span>Costo:</span> <strong>{puntosCost} Eco-Points</strong>
                  </p>
                  <p>
                    <span>Tu saldo:</span> <strong>{availablePoints} Eco-Points</strong>
                  </p>
                </div>
                {!hasEnoughPoints && (
                  <p className="course-payment-warning">
                    No tenés Eco-Points suficientes. Completá más acciones sustentables para
                    desbloquearlo.
                  </p>
                )}
              </div>
            </>
          )}

          <button
            id="btn-pagar-acciones"
            className="submit-btn modal-action-btn"
            type="button"
            onClick={confirmar}
            disabled={enviando || (isPointsOnly && !hasEnoughPoints)}
          >
            {isFree && "Desbloquear curso"}
            {isMixed && (enviando ? "Procesando..." : "Confirmar pago simulado")}
            {isMoneyOnly &&
              (enviando
                ? "Procesando..."
                : `Pagar ${formatMoney(price, currency)} (simulado)`)}
            {isPointsOnly &&
              (hasEnoughPoints
                ? enviando
                  ? "Procesando..."
                  : "Pagar con acciones sustentables"
                : "Eco-Points insuficientes")}
          </button>
        </>
      )}
    </div>
  );
}

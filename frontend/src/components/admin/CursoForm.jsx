import { useEffect, useRef, useState } from "react";
import { actualizarCurso, crearCurso } from "../../api";
import useForm from "../../hooks/useForm";
import { getApiErrorMessage } from "../../utils/apiError";
import { getCoursePaymentLabelFromCosts } from "../../utils/courses";
import MensajeAdmin from "./MensajeAdmin";

const crearClaveModulo = () =>
  `modulo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const crearModulosIniciales = (curso) => {
  if (Array.isArray(curso?.modules) && curso.modules.length > 0) {
    return curso.modules.map((modulo) => ({
      clave: crearClaveModulo(),
      _id: modulo._id || "",
      title: modulo.title || "",
      description: modulo.description || "",
      videoUrl: modulo.videoUrl || "",
      pdfUrl: modulo.pdfUrl || "",
    }));
  }

  if (curso?.contentDetails) {
    return [
      {
        clave: crearClaveModulo(),
        _id: "",
        title: "Contenido del curso",
        description: curso.contentDetails,
        videoUrl: "",
        pdfUrl: "",
      },
    ];
  }

  return [];
};

export default function CursoForm({ abierto, curso, onCerrar, onGuardado }) {
  const { valores, cambiar } = useForm({
    title: curso?.title || "",
    duration: curso?.duration || "",
    pointsCost: curso?.pointsCost ?? 30,
    price: curso?.price ?? 0,
    currency: curso?.currency || "UYU",
    level: curso?.level || "todos",
    description: curso?.description || "",
    videoUrl: curso?.videoUrl || "",
    pdfUrl: curso?.pdfUrl || "",
  });
  const archivoRef = useRef(null);
  const contenedorRef = useRef(null);
  const [modulos, setModulos] = useState(() => crearModulosIniciales(curso));
  const [aviso, setAviso] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!abierto) return;
    contenedorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [abierto]);

  const agregarModulo = () => {
    setModulos((anteriores) => [
      ...anteriores,
      { clave: crearClaveModulo(), _id: "", title: "", description: "", videoUrl: "", pdfUrl: "" },
    ]);
  };

  const cambiarModulo = (clave, campo, valor) => {
    setModulos((anteriores) =>
      anteriores.map((modulo) =>
        modulo.clave === clave ? { ...modulo, [campo]: valor } : modulo,
      ),
    );
  };

  const quitarModulo = (clave) => {
    setModulos((anteriores) => anteriores.filter((modulo) => modulo.clave !== clave));
  };

  const moverModulo = (indice, direccion) => {
    setModulos((anteriores) => {
      const destino = indice + direccion;

      if (destino < 0 || destino >= anteriores.length) return anteriores;

      const copia = [...anteriores];
      [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
      return copia;
    });
  };

  const enviar = async (evento) => {
    evento.preventDefault();

    if (modulos.length === 0) {
      setAviso({ tipo: "error", texto: "Agregá al menos un módulo al curso." });
      return;
    }

    const formData = new FormData();
    const archivo = archivoRef.current?.files?.[0];
    const modulosLimpios = modulos.map((modulo) => ({
      ...(modulo._id ? { _id: modulo._id } : {}),
      title: modulo.title.trim(),
      description: modulo.description.trim(),
      videoUrl: modulo.videoUrl.trim(),
      pdfUrl: modulo.pdfUrl.trim(),
    }));

    formData.append("title", valores.title.trim());
    formData.append("description", valores.description.trim());
    formData.append("duration", valores.duration.trim());
    formData.append("level", valores.level);
    formData.append("pointsCost", Number(valores.pointsCost));
    formData.append("price", Number(valores.price));
    formData.append("currency", valores.currency);
    formData.append("modules", JSON.stringify(modulosLimpios));
    formData.append("videoUrl", valores.videoUrl.trim());
    formData.append("pdfUrl", valores.pdfUrl.trim());

    if (archivo) formData.append("image", archivo);

    setEnviando(true);
    setAviso(null);

    try {
      const { datos } = curso
        ? await actualizarCurso(curso._id, formData)
        : await crearCurso(formData);

      if (datos?.success) {
        onGuardado(
          datos.message ||
            (curso ? "Curso actualizado con éxito." : "Curso creado con éxito."),
        );
      } else {
        setAviso({ tipo: "error", texto: getApiErrorMessage(datos) });
      }
    } catch {
      setAviso({ tipo: "error", texto: "No se pudo guardar el curso." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      id="course-form-container"
      ref={contenedorRef}
      className={abierto ? "admin-section admin-form-box is-open" : "admin-section admin-form-box"}
    >
      <h2 className="admin-title" id="course-form-title">
        {curso ? "Editar curso" : "Nuevo curso"}
      </h2>
      <div id="course-feedback" aria-live="polite">
        <MensajeAdmin mensaje={aviso} />
      </div>
      <form id="create-course-form" onSubmit={enviar}>
        <input type="hidden" id="course-id" value={curso?._id || ""} readOnly />
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="title">Título del Curso</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              placeholder="Ej: Jardinería Urbana"
              value={valores.title}
              onChange={cambiar}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="duration">Duración</label>
            <input
              type="text"
              id="duration"
              name="duration"
              required
              placeholder="Ej: 4 semanas"
              value={valores.duration}
              onChange={cambiar}
            />
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="modulesCount">Cantidad de Módulos</label>
            <input
              type="number"
              id="modulesCount"
              name="modulesCount"
              value={modulos.length}
              readOnly
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="pointsCost">Eco-Points requeridos</label>
            <input
              type="number"
              id="pointsCost"
              name="pointsCost"
              min="0"
              step="1"
              required
              value={valores.pointsCost}
              onChange={cambiar}
            />
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="price">Precio (Dinero)</label>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              step="0.01"
              value={valores.price}
              onChange={cambiar}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="currency">Moneda</label>
            <select
              id="currency"
              name="currency"
              value={valores.currency}
              onChange={cambiar}
            >
              <option value="UYU">UYU</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label htmlFor="level">Nivel</label>
            <select id="level" name="level" value={valores.level} onChange={cambiar}>
              <option value="todos">Apto para todos</option>
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label htmlFor="paymentTypePreview">Modalidad de pago</label>
            <input
              type="text"
              id="paymentTypePreview"
              value={getCoursePaymentLabelFromCosts(valores.pointsCost, valores.price)}
              readOnly
            />
          </div>
        </div>
        <p className="admin-hint">
          La modalidad de pago se calcula automáticamente según los Eco-Points y el precio.
        </p>
        <div className="admin-form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            rows="3"
            required
            placeholder="Descripción del curso"
            value={valores.description}
            onChange={cambiar}
          ></textarea>
        </div>
        <div className="admin-modules">
          <div className="admin-modules-head">
            <h3 className="admin-modules-title">Módulos del curso</h3>
            <button
              type="button"
              className="admin-btn-create admin-module-add"
              onClick={agregarModulo}
            >
              Agregar módulo
            </button>
          </div>
          <p className="admin-hint">
            Cada módulo tiene un título, una descripción y sus propios recursos. Usá las
            flechas para cambiar el orden.
          </p>
          {modulos.length === 0 ? (
            <p className="admin-empty">Todavía no agregaste módulos.</p>
          ) : (
            <ul className="admin-module-list">
              {modulos.map((modulo, indice) => (
                <li className="admin-module-item" key={modulo.clave}>
                  <div className="admin-module-head">
                    <span className="admin-module-number">Módulo {indice + 1}</span>
                    <div className="admin-module-actions">
                      <button
                        type="button"
                        className="admin-module-move"
                        onClick={() => moverModulo(indice, -1)}
                        disabled={indice === 0}
                        aria-label={`Subir módulo ${indice + 1}`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="admin-module-move"
                        onClick={() => moverModulo(indice, 1)}
                        disabled={indice === modulos.length - 1}
                        aria-label={`Bajar módulo ${indice + 1}`}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="admin-module-remove"
                        onClick={() => quitarModulo(modulo.clave)}
                        aria-label={`Quitar módulo ${indice + 1}`}
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor={`module-title-${modulo.clave}`}>Título del módulo</label>
                    <input
                      type="text"
                      id={`module-title-${modulo.clave}`}
                      required
                      minLength={3}
                      maxLength={120}
                      placeholder="Ej: Introducción al reciclaje"
                      value={modulo.title}
                      onChange={(evento) =>
                        cambiarModulo(modulo.clave, "title", evento.target.value)
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor={`module-description-${modulo.clave}`}>
                      Descripción del módulo
                    </label>
                    <textarea
                      id={`module-description-${modulo.clave}`}
                      rows="2"
                      maxLength={1000}
                      placeholder="Qué vas a aprender en este módulo"
                      value={modulo.description}
                      onChange={(evento) =>
                        cambiarModulo(modulo.clave, "description", evento.target.value)
                      }
                    ></textarea>
                  </div>
                  <div className="admin-form-grid admin-module-resources">
                    <div className="admin-form-group">
                      <label htmlFor={`module-video-${modulo.clave}`}>
                        URL del video del módulo (opcional)
                      </label>
                      <input
                        type="url"
                        id={`module-video-${modulo.clave}`}
                        maxLength={500}
                        placeholder="https://..."
                        value={modulo.videoUrl}
                        onChange={(evento) =>
                          cambiarModulo(modulo.clave, "videoUrl", evento.target.value)
                        }
                      />
                    </div>
                    <div className="admin-form-group">
                      <label htmlFor={`module-pdf-${modulo.clave}`}>
                        URL del PDF del módulo (opcional)
                      </label>
                      <input
                        type="url"
                        id={`module-pdf-${modulo.clave}`}
                        maxLength={500}
                        placeholder="https://..."
                        value={modulo.pdfUrl}
                        onChange={(evento) =>
                          cambiarModulo(modulo.clave, "pdfUrl", evento.target.value)
                        }
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="admin-modules">
          <h3 className="admin-modules-title">Recursos generales del curso</h3>
          <p className="admin-hint">
            Son opcionales y se muestran junto a los recursos de cada módulo. Sirven para una
            guía o un video introductorio de todo el curso.
          </p>
          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label htmlFor="videoUrl">URL del video general (opcional)</label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                maxLength={500}
                placeholder="https://..."
                value={valores.videoUrl}
                onChange={cambiar}
              />
            </div>
            <div className="admin-form-group">
              <label htmlFor="pdfUrl">URL del PDF general (opcional)</label>
              <input
                type="url"
                id="pdfUrl"
                name="pdfUrl"
                maxLength={500}
                placeholder="https://..."
                value={valores.pdfUrl}
                onChange={cambiar}
              />
            </div>
          </div>
        </div>
        <div className="admin-form-group">
          <label htmlFor="image">Imagen del curso (obligatoria al crear)</label>
          <input
            type="file"
            id="image"
            name="image"
            ref={archivoRef}
            accept="image/jpeg,image/png,image/webp"
            required={!curso}
          />
        </div>
        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn-create"
            id="course-submit-btn"
            disabled={enviando}
          >
            {curso ? "Actualizar curso" : "Guardar curso"}
          </button>
          <button type="button" id="cancel-course-btn" className="admin-btn-cancel" onClick={onCerrar}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

import { formatUnitRate, getCooldownDays, getCooldownLabel } from "../utils/actions";
import { DEFAULT_COURSE_IMAGE, resolveAssetUrl } from "../utils/format";

export default function ActionCard({ accion, textoBoton = "Subir evidencia", deshabilitado = false, onSubir }) {
  const diasEspera = getCooldownDays(accion);

  return (
    <article className="validate-card">
      <div className="validate-media">
        <img
          src={resolveAssetUrl(accion.image)}
          alt={accion.imageAlt || accion.title || "Acción sustentable"}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = DEFAULT_COURSE_IMAGE;
          }}
        />
        <span className="validate-tag">
          {accion.pointsPerUnit} Eco-Points por {formatUnitRate(accion.unit || "acción")}
        </span>
      </div>

      <div className="validate-body">
        <h2 className="validate-name">{accion.title}</h2>
        <p className="validate-desc">{accion.description}</p>
        <p className="validate-cooldown">
          {diasEspera > 0
            ? `Se puede repetir cada ${getCooldownLabel(diasEspera)}.`
            : "Se puede repetir cuando se apruebe la evidencia anterior."}
        </p>
        <button
          type="button"
          className="validate-submit-btn"
          data-action-key={accion.key}
          disabled={deshabilitado}
          onClick={onSubir}
        >
          {textoBoton}
        </button>
      </div>
    </article>
  );
}

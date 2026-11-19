import { Link } from "react-router-dom";
import { formatShortDate } from "../utils/format";

export default function PointsHistory({ movimientos, resumen }) {
  return (
    <>
      <div className="points-summary">
        <div className="points-summary-item">
          <span className="points-summary-label">Ganados</span>
          <strong className="points-summary-value earned">+{resumen.earned}</strong>
        </div>
        <div className="points-summary-item">
          <span className="points-summary-label">Canjeados</span>
          <strong className="points-summary-value spent">-{resumen.spent}</strong>
        </div>
        <div className="points-summary-item">
          <span className="points-summary-label">Saldo disponible</span>
          <strong className="points-summary-value">{resumen.balance}</strong>
        </div>
      </div>

      {movimientos.length === 0 ? (
        <div className="dashboard-empty">
          <p>Todavía no tenés movimientos de Eco-Points.</p>
          <Link to="/validar" className="dashboard-empty-link">
            Validar acción
          </Link>
        </div>
      ) : (
        <div id="dashboard-points" className="dashboard-list">
          {movimientos.map((movimiento) => (
            <article key={movimiento._id} className="submission-item dashboard-points-item">
              <div className="submission-info">
                <h3>{movimiento.description}</h3>
                <p>
                  {movimiento.type === "earned" ? "Puntos ganados" : "Puntos canjeados"} ·{" "}
                  {formatShortDate(movimiento.date)}
                </p>
              </div>
              <span className={`points-amount ${movimiento.type}`}>
                {movimiento.type === "earned" ? "+" : "-"}
                {movimiento.points}
              </span>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

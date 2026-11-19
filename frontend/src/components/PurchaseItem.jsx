import { formatShortDate } from "../utils/format";
import { getPurchaseParts, getPurchaseSummary } from "../utils/purchases";

export default function PurchaseItem({ compra }) {
  const { moneySpent } = getPurchaseParts(compra);

  return (
    <article className="submission-item dashboard-purchase-item">
      <div className="submission-info">
        <h3>{compra.course?.title || compra.courseTitle || "Curso eliminado"}</h3>
        <p>
          {getPurchaseSummary(compra)} · {formatShortDate(compra.purchasedAt)}
        </p>
        {moneySpent > 0 && <span className="purchase-simulated-badge">Pago simulado</span>}
        {compra.refundedAt && (
          <span className="submission-status rejected">Reembolsado</span>
        )}
      </div>
    </article>
  );
}

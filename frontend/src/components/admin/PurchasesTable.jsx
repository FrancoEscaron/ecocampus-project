import { formatMoney } from "../../utils/format";
import { getMoneyTotalsByCurrency } from "../../utils/purchases";

export default function PurchasesTable({ usuarios }) {
  return (
    <table className="admin-table">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Correo</th>
          <th>Eco-Points</th>
          <th>Cursos</th>
          <th>Compras</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((usuario) => {
          const cursos = (usuario.coursesOwned || [])
            .map((curso) => curso?.title)
            .filter(Boolean)
            .join(", ");
          const compras = usuario.pointsPurchases || [];
          const gastados = compras.reduce(
            (total, compra) => total + (Number(compra.pointsSpent) || 0),
            0,
          );
          const dinero = Object.entries(getMoneyTotalsByCurrency(compras))
            .map(([currency, amount]) => formatMoney(amount, currency))
            .join(" + ");

          return (
            <tr key={usuario.email}>
              <td>
                {usuario.name} {usuario.lastName}
              </td>
              <td>{usuario.email}</td>
              <td>{usuario.ecoPoints ?? 0}</td>
              <td>{cursos || "—"}</td>
              <td>
                {compras.length
                  ? `${compras.length} compra(s) · ${gastados} Eco-Points${
                      dinero ? ` · ${dinero} simulados` : ""
                    }`
                  : "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

import { useState } from "react";
import AdminCard from "./AdminCard";
import { formatDateTime } from "../../utils/format";

export default function MensajesList({ mensajes, onMarcarLeido, onEliminar }) {
  const [confirmando, setConfirmando] = useState(null);

  return (
    <>
      {mensajes.map((mensaje) => {
        const nombre = `${mensaje.nombre} ${mensaje.apellido}`.trim();
        const fecha = formatDateTime(mensaje.createdAt);
        const meta = [mensaje.correo, fecha].filter(Boolean).join(" · ");
        const enConfirmacion = confirmando === mensaje._id;
        const acciones = [
          {
            label: mensaje.read ? "Marcar como no leído" : "Marcar como leído",
            className: "admin-btn-neutral",
            onClick: () => onMarcarLeido(mensaje._id, !mensaje.read),
          },
        ];

        if (enConfirmacion) {
          acciones.push(
            {
              label: "Confirmar eliminación",
              className: "admin-btn-delete",
              onClick: () => {
                setConfirmando(null);
                onEliminar(mensaje._id);
              },
            },
            {
              label: "Cancelar",
              className: "admin-btn-neutral",
              onClick: () => setConfirmando(null),
            },
          );
        } else {
          acciones.push({
            label: "Eliminar",
            className: "admin-btn-delete",
            onClick: () => setConfirmando(mensaje._id),
          });
        }

        return (
          <AdminCard
            key={mensaje._id}
            title={nombre || "Sin nombre"}
            meta={meta}
            description={mensaje.mensaje}
            badge={{
              className: mensaje.read ? "approved" : "pending",
              text: mensaje.read ? "Leído" : "Nuevo",
            }}
            acciones={acciones}
          >
            <a className="admin-contact-link" href={`mailto:${mensaje.correo}`}>
              Responder por email
            </a>
          </AdminCard>
        );
      })}
    </>
  );
}

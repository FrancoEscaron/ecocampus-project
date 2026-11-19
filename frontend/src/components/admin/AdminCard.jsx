export default function AdminCard({
  imageUrl,
  title,
  meta,
  price,
  description,
  badge,
  acciones = [],
  children,
}) {
  return (
    <div className="admin-card-item">
      <div className="admin-card-info">
        {imageUrl && <img className="admin-card-thumb" src={imageUrl} alt={title} />}
        <div className="admin-card-text">
          <h3 className="admin-card-title">{title}</h3>
          {meta && <p className="admin-card-meta">{meta}</p>}
          {price && <p className="admin-card-price">{price}</p>}
          {description && <p className="admin-card-description">{description}</p>}
          {badge && (
            <span className={`admin-status-badge ${badge.className}`}>{badge.text}</span>
          )}
          {children}
        </div>
      </div>

      <div className="admin-card-actions">
        {acciones.map((accion) => (
          <button
            key={accion.label}
            type="button"
            className={accion.className}
            disabled={accion.disabled}
            title={accion.title}
            onClick={accion.onClick}
          >
            {accion.label}
          </button>
        ))}
      </div>
    </div>
  );
}

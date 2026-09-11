export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel, danger = true }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel} role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-title">{title}</h3>
        <p className="modal-message">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

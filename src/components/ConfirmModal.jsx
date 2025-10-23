export default function ConfirmModal({ show, message, onConfirm, onCancel, darkMode }) {
  if (!show) return null;

  return (
    <div className={`modal-overlay ${darkMode ? "dark" : ""}`}>
      <div className="modal-box">
        <p>{message}</p>
        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="delete-btnModal" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

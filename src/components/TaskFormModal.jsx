import { useState } from "react";

export default function TaskFormModal({ open, initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || "");
  const [error, setError] = useState("");

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { setError("Give the task a title."); return; }
    onSave({ title: title.trim(), description, dueDate: dueDate || null });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card modal-form" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? "Edit task" : "New task"}</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="taskTitle">Task</label>
            <input id="taskTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Write outline" autoFocus />
            {error && <p className="field-error">{error}</p>}
          </div>
          <div className="field">
            <label htmlFor="taskDesc">Notes (optional)</label>
            <textarea id="taskDesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="taskDue">Due date (optional)</label>
            <input id="taskDue" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Save changes" : "Add task"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import Icon from "./Icon";

const ICONS = ["leaf", "book", "droplet", "target", "smile", "sun", "feather", "layers"];
const COLORS = ["forest", "gold", "clay", "sky"];

export default function HabitFormModal({ open, initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [icon, setIcon] = useState(initial?.icon || "leaf");
  const [color, setColor] = useState(initial?.color || "forest");
  const [error, setError] = useState("");

  if (!open) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Give your habit a name."); return; }
    onSave({ name: name.trim(), icon, color });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card modal-form" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? "Edit habit" : "New habit"}</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="habitName">What do you want to build?</label>
            <input id="habitName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Read for 20 minutes" autoFocus />
            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="field">
            <label>Icon</label>
            <div className="icon-swatch-picker">
              {ICONS.map((i) => (
                <button key={i} type="button" className={`swatch-btn ${icon === i ? "active" : ""}`} onClick={() => setIcon(i)} aria-label={i}>
                  <Icon name={i} size={17} />
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label>Color</label>
            <div className="color-swatch-picker">
              {COLORS.map((c) => (
                <button key={c} type="button" className={`color-dot-btn ${color === c ? "active" : ""} accent-${c}`} style={{ background: `var(--${c === "gold" ? "gold" : c})` }} onClick={() => setColor(c)} aria-label={c} />
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Save changes" : "Add habit"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

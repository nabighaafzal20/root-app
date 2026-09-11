import { useState } from "react";
import Icon from "./Icon";

const COLORS = ["forest", "gold", "clay", "sky"];

export default function ProjectFormModal({ open, initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [color, setColor] = useState(initial?.color || "forest");
  const [collaborators, setCollaborators] = useState(initial?.collaborators || []);
  const [collabDraft, setCollabDraft] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function addCollaborator(e) {
    e.preventDefault();
    const c = collabDraft.trim();
    if (c && !collaborators.includes(c)) setCollaborators([...collaborators, c]);
    setCollabDraft("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Give the project a name."); return; }
    onSave({ name: name.trim(), description, color, collaborators });
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card modal-form" onClick={(e) => e.stopPropagation()}>
        <h3>{initial ? "Edit project" : "New project"}</h3>
        <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
          <div className="field">
            <label htmlFor="projName">Project name</label>
            <input id="projName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Learn Spanish" autoFocus />
            {error && <p className="field-error">{error}</p>}
          </div>

          <div className="field">
            <label htmlFor="projDesc">Description (optional)</label>
            <textarea id="projDesc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's this project about?" />
          </div>

          <div className="field">
            <label>Color</label>
            <div className="color-swatch-picker">
              {COLORS.map((c) => (
                <button key={c} type="button" className={`color-dot-btn ${color === c ? "active" : ""}`} style={{ background: `var(--${c})` }} onClick={() => setColor(c)} aria-label={c} />
              ))}
            </div>
          </div>

          <div className="field">
            <label>Collaborators (optional)</label>
            <p className="field-hint" style={{ marginBottom: 6 }}>Root runs in your browser only, so collaborators are just labels here — not real shared accounts.</p>
            <div className="collab-input-row">
              {collaborators.map((c) => (
                <span key={c} className="tag">
                  {c}
                  <button type="button" className="tag-remove" onClick={() => setCollaborators(collaborators.filter((x) => x !== c))} aria-label={`Remove ${c}`}><Icon name="x" size={11} /></button>
                </span>
              ))}
              <form onSubmit={addCollaborator} style={{ display: "inline-flex", gap: 6 }}>
                <input placeholder="Add name…" value={collabDraft} onChange={(e) => setCollabDraft(e.target.value)} style={{ border: "1.5px solid var(--border)", borderRadius: 8, padding: "5px 9px", fontSize: 13 }} />
              </form>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn btn-primary">{initial ? "Save changes" : "Create project"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

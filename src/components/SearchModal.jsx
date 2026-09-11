import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { useData } from "../context/DataContext";
import { formatShortDate } from "../lib/id";

export default function SearchModal({ open, onClose }) {
  const { journal, habits, projects, tasks } = useData();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const out = [];
    journal.forEach((j) => {
      const text = `${j.title} ${j.content}`.replace(/<[^>]+>/g, " ").toLowerCase();
      if (text.includes(q)) out.push({ type: "journal", id: j.id, title: j.title || "Untitled entry", meta: formatShortDate(j.date), icon: "feather", go: `/journal/${j.id}` });
    });
    habits.forEach((h) => {
      if (h.name.toLowerCase().includes(q)) out.push({ type: "habit", id: h.id, title: h.name, meta: "Habit", icon: "target", go: `/habits` });
    });
    projects.forEach((p) => {
      if (p.name.toLowerCase().includes(q)) out.push({ type: "project", id: p.id, title: p.name, meta: "Project", icon: "layers", go: `/projects/${p.id}` });
    });
    tasks.forEach((t) => {
      if (t.title.toLowerCase().includes(q)) {
        const project = projects.find((p) => p.id === t.projectId);
        out.push({ type: "task", id: t.id, title: t.title, meta: project ? `Task in ${project.name}` : "Task", icon: "check", go: `/projects/${t.projectId}` });
      }
    });
    return out.slice(0, 20);
  }, [query, journal, habits, projects, tasks]);

  if (!open) return null;

  function go(r) {
    navigate(r.go);
    onClose();
  }

  return (
    <div className="search-modal-overlay" role="presentation" onClick={onClose}>
      <div className="search-modal" role="dialog" aria-modal="true" aria-label="Search Root" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-input">
          <Icon name="search" size={19} />
          <input
            autoFocus
            placeholder="Search journal entries, habits, projects, tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-icon" onClick={onClose} aria-label="Close search"><Icon name="x" size={18} /></button>
        </div>
        <div className="search-results">
          {query && results.length === 0 && (
            <p style={{ padding: "20px 16px", color: "var(--muted)", fontSize: "0.88rem" }}>Nothing matches "{query}" yet.</p>
          )}
          {!query && (
            <p style={{ padding: "20px 16px", color: "var(--muted)", fontSize: "0.88rem" }}>Start typing to search everything in Root.</p>
          )}
          {results.map((r) => (
            <button key={`${r.type}-${r.id}`} className="search-result" onClick={() => go(r)}>
              <span className="search-result-icon"><Icon name={r.icon} size={16} /></span>
              <span className="search-result-meta">
                <strong>{r.title}</strong>
                <span>{r.meta}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

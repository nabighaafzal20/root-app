import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import EmptyState from "../../components/EmptyState";
import Icon from "../../components/Icon";
import JournalCalendar from "./JournalCalendar";
import { formatFriendlyDate } from "../../lib/id";

const MOODS = ["great", "good", "calm", "meh", "rough"];

export default function JournalList() {
  const { journal } = useData();
  const navigate = useNavigate();
  const [view, setView] = useState("list");
  const [q, setQ] = useState("");
  const [mood, setMood] = useState("all");

  const allTags = useMemo(() => [...new Set(journal.flatMap((j) => j.tags || []))], [journal]);
  const [tag, setTag] = useState("all");

  const filtered = useMemo(() => {
    return journal.filter((j) => {
      const text = `${j.title} ${j.content}`.replace(/<[^>]+>/g, " ").toLowerCase();
      if (q && !text.includes(q.toLowerCase())) return false;
      if (mood !== "all" && j.mood !== mood) return false;
      if (tag !== "all" && !(j.tags || []).includes(tag)) return false;
      return true;
    });
  }, [journal, q, mood, tag]);

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-sub">{journal.length} {journal.length === 1 ? "entry" : "entries"} so far</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`chip-toggle ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>List</button>
          <button className={`chip-toggle ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>Calendar</button>
          <button className="btn btn-primary" onClick={() => navigate("/journal/new")}><Icon name="plus" size={16} /> New entry</button>
        </div>
      </div>

      {view === "list" ? (
        <>
          <div className="filter-bar">
            <input type="search" placeholder="Search entries…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="all">Any mood</option>
              {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            {allTags.length > 0 && (
              <select value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="all">Any tag</option>
                {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="feather" title={journal.length === 0 ? "Your journal is empty" : "No entries match"} message={journal.length === 0 ? "Write your first entry — how did today go?" : "Try a different search or filter."} action={journal.length === 0 && <Link to="/journal/new" className="btn btn-primary">Write an entry</Link>} />
          ) : (
            <div className="journal-list">
              {filtered.map((j) => {
                const d = new Date(j.date + "T00:00:00");
                return (
                  <Link to={`/journal/${j.id}`} key={j.id} className="journal-row">
                    <div className="journal-row-date">
                      <div className="day">{d.getDate()}</div>
                      <div className="mon">{d.toLocaleDateString(undefined, { month: "short" })}</div>
                    </div>
                    <div className="journal-row-body">
                      <h4>{j.title || "Untitled entry"}</h4>
                      <p>{j.content.replace(/<[^>]+>/g, " ").slice(0, 180)}</p>
                      <div className="journal-row-meta">
                        <span className={`mood-chip mood-${j.mood}`}>{j.mood}</span>
                        {(j.tags || []).map((t) => <span key={t} className="tag">{t}</span>)}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <JournalCalendar entries={journal} />
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import RichTextEditor from "../../components/RichTextEditor";
import ConfirmDialog from "../../components/ConfirmDialog";
import Icon from "../../components/Icon";
import { todayISO, formatFriendlyDate } from "../../lib/id";
import { downloadMarkdown, downloadPdf } from "../../lib/exportEntry";

const MOODS = [
  { id: "great", label: "Great" },
  { id: "good", label: "Good" },
  { id: "calm", label: "Calm" },
  { id: "meh", label: "Meh" },
  { id: "rough", label: "Rough" },
];

// Keyed wrapper: forces a full remount whenever the entry id changes, so
// navigating straight from one entry to another (e.g. via search) doesn't
// carry over stale editor state from the previous entry.
export default function JournalEntry() {
  const { id } = useParams();
  return <JournalEntryInner key={id} />;
}

function JournalEntryInner() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { journal, addJournalEntry, updateJournalEntry, deleteJournalEntry, habits, tasks, isHabitDone } = useData();
  const { showToast } = useToast();

  const existing = journal.find((j) => j.id === id);
  const [date] = useState(existing?.date || params.get("date") || todayISO());
  const [title, setTitle] = useState(existing?.title || "");
  const [content, setContent] = useState(existing?.content || "");
  const [mood, setMood] = useState(existing?.mood || "calm");
  const [tags, setTags] = useState(existing?.tags || []);
  const [tagDraft, setTagDraft] = useState("");
  const [linkedHabitIds, setLinkedHabitIds] = useState(existing?.linkedHabitIds || []);
  const [linkedTaskIds, setLinkedTaskIds] = useState(existing?.linkedTaskIds || []);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [currentId, setCurrentId] = useState(existing?.id || null);
  const [saveState, setSaveState] = useState("saved");

  useEffect(() => {
    if (!isNew && !existing) {
      // entry not found (bad id) — bounce to list
      navigate("/journal", { replace: true });
    }
  }, [isNew, existing, navigate]);

  useEffect(() => {
    setSaveState("unsaved");
    const t = setTimeout(() => {
      save();
      setSaveState("saved");
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, mood, tags, linkedHabitIds, linkedTaskIds]);

  function save() {
    if (!title && !content.replace(/<[^>]+>/g, "").trim()) return; // nothing to save yet
    const payload = { title, content, mood, tags, linkedHabitIds, linkedTaskIds, date };
    if (currentId) {
      updateJournalEntry(currentId, payload);
    } else {
      const created = addJournalEntry(payload);
      setCurrentId(created.id);
      window.history.replaceState(null, "", `/journal/${created.id}`);
    }
  }

  function handleDelete() {
    if (currentId) deleteJournalEntry(currentId);
    showToast("Entry deleted.");
    navigate("/journal");
  }

  function addTag(e) {
    e.preventDefault();
    const t = tagDraft.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagDraft("");
  }

  const habitsToday = habits.filter((h) => !h.archived && isHabitDone(h.id, date));
  const tasksCompletedToday = tasks.filter((t) => t.status === "done" && t.completedAt && new Date(t.completedAt).toISOString().slice(0, 10) === date);

  function toggleHabitLink(hid) {
    setLinkedHabitIds((ids) => ids.includes(hid) ? ids.filter((x) => x !== hid) : [...ids, hid]);
  }
  function toggleTaskLink(tid) {
    setLinkedTaskIds((ids) => ids.includes(tid) ? ids.filter((x) => x !== tid) : [...ids, tid]);
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <Link to="/journal" className="auth-back" style={{ marginBottom: 0 }}>← Back to journal</Link>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 12.5, color: "var(--muted-light)" }}>{saveState === "saved" ? "Saved" : "Saving…"}</span>
          {currentId && (
            <>
              <button className="btn btn-ghost btn-sm" onClick={() => downloadMarkdown({ title, content, mood, tags, date })}><Icon name="download" size={14} /> Markdown</button>
              <button className="btn btn-ghost btn-sm" onClick={() => downloadPdf({ title, content, mood, tags, date })}><Icon name="download" size={14} /> PDF</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={14} /></button>
            </>
          )}
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 4 }}>{formatFriendlyDate(date)}</p>
          <input className="entry-title-input" placeholder="Entry title" value={title} onChange={(e) => setTitle(e.target.value)} />

          <div className="entry-meta-bar">
            <div className="mood-picker">
              {MOODS.map((m) => (
                <button key={m.id} type="button" className={`mood-chip mood-${m.id} ${mood === m.id ? "is-selected" : ""}`} onClick={() => setMood(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="tag-input-row" style={{ marginBottom: 18 }}>
            <Icon name="tag" size={15} />
            {tags.map((t) => (
              <span key={t} className="tag">
                {t}
                <button className="tag-remove" onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove tag ${t}`}><Icon name="x" size={11} /></button>
              </span>
            ))}
            <form onSubmit={addTag} style={{ display: "inline" }}>
              <input placeholder="Add tag…" value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} />
            </form>
          </div>

          <RichTextEditor value={content} onChange={setContent} placeholder="How did today go?" />
        </div>

        <div>
          <div className="card">
            <div className="card-head"><h3>Link today's progress</h3></div>
            <p className="page-sub" style={{ marginBottom: 10 }}>Connect this entry to habits or tasks you completed that day.</p>

            {habitsToday.length === 0 && tasksCompletedToday.length === 0 ? (
              <p style={{ fontSize: 13.5, color: "var(--muted-light)" }}>Nothing completed on {date} yet — check off a habit or finish a task to link it here.</p>
            ) : (
              <div className="link-picker">
                {habitsToday.map((h) => (
                  <label key={h.id}>
                    <input type="checkbox" checked={linkedHabitIds.includes(h.id)} onChange={() => toggleHabitLink(h.id)} />
                    <Icon name={h.icon} size={14} /> {h.name}
                  </label>
                ))}
                {tasksCompletedToday.map((t) => (
                  <label key={t.id}>
                    <input type="checkbox" checked={linkedTaskIds.includes(t.id)} onChange={() => toggleTaskLink(t.id)} />
                    <Icon name="check" size={14} /> {t.title}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this entry?"
        message="This can't be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

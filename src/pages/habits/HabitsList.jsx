import { useState } from "react";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import Icon from "../../components/Icon";
import EmptyState from "../../components/EmptyState";
import HabitFormModal from "../../components/HabitFormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import { computeStreak, computeBestStreak, last7Days } from "../../lib/streaks";
import { todayISO } from "../../lib/id";

export default function HabitsList() {
  const { habits, addHabit, updateHabit, deleteHabit, toggleHabitLog, isHabitDone, logsFor } = useData();
  const { showToast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const active = habits.filter((h) => !h.archived);
  const archived = habits.filter((h) => h.archived);
  const week = last7Days();
  const today = todayISO();

  function handleSave(data) {
    if (editing) {
      updateHabit(editing.id, data);
      showToast("Habit updated.");
    } else {
      addHabit(data);
    }
    setModalOpen(false);
    setEditing(null);
  }

  function handleDelete() {
    deleteHabit(toDelete.id);
    showToast("Habit deleted.");
    setToDelete(null);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Habits</h1>
          <p className="page-sub">Small, repeated actions — this week at a glance.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModalOpen(true); }}><Icon name="plus" size={16} /> New habit</button>
      </div>

      {active.length === 0 ? (
        <EmptyState icon="target" title="No habits yet" message="Add the first habit you want to build a streak on." action={<button className="btn btn-primary" onClick={() => setModalOpen(true)}>Add a habit</button>} />
      ) : (
        <div className="grid-list grid-cols-2">
          {active.map((h) => {
            const logs = logsFor(h.id);
            const streak = computeStreak(logs);
            const best = computeBestStreak(logs);
            return (
              <div className="card habit-card" key={h.id}>
                <div className="habit-card-top">
                  <span className={`habit-card-icon habit-check-icon--${h.color}`}><Icon name={h.icon} size={19} /></span>
                  <div className="habit-card-title">
                    <h4>{h.name}</h4>
                    <span>{h.frequency}</span>
                  </div>
                  <div className="habit-card-actions">
                    <button className="btn-icon" onClick={() => { setEditing(h); setModalOpen(true); }} aria-label="Edit habit"><Icon name="edit" size={15} /></button>
                    <button className="btn-icon" onClick={() => { updateHabit(h.id, { archived: true }); showToast("Habit archived."); }} aria-label="Archive habit"><Icon name="archive" size={15} /></button>
                    <button className="btn-icon" onClick={() => setToDelete(h)} aria-label="Delete habit"><Icon name="trash" size={15} /></button>
                  </div>
                </div>

                <div className="habit-week-strip">
                  {week.map((d) => {
                    const done = isHabitDone(h.id, d);
                    const dayLabel = new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "narrow" });
                    return (
                      <div className="habit-week-day" key={d}>
                        <span className="lbl">{dayLabel}</span>
                        <button className={`dot ${done ? "done" : ""} ${d === today ? "today" : ""}`} onClick={() => toggleHabitLog(h.id, d)} aria-label={`${h.name} on ${d}`}>
                          {done && <Icon name="check" size={13} strokeWidth={3} />}
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="habit-card-foot">
                  <span className="habit-streak-badge"><Icon name="sparkle" size={14} /> {streak}-day streak</span>
                  <span style={{ fontSize: 12.5, color: "var(--muted-light)" }}>best: {best}d</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {archived.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: "1rem", color: "var(--muted)", marginBottom: 12 }}>Archived</h3>
          <div className="grid-list grid-cols-2">
            {archived.map((h) => (
              <div className="card" key={h.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.7 }}>
                <span>{h.name}</span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => updateHabit(h.id, { archived: false })}>Restore</button>
                  <button className="btn-icon" onClick={() => setToDelete(h)}><Icon name="trash" size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length > 0 && (
        <button className="link-strong" style={{ marginTop: 20, fontSize: 13 }} onClick={() => setModalOpen(true)}>+ Add another habit</button>
      )}

      <HabitFormModal open={modalOpen} initial={editing} onSave={handleSave} onCancel={() => { setModalOpen(false); setEditing(null); }} />
      <ConfirmDialog open={!!toDelete} title={`Delete "${toDelete?.name}"?`} message="Its history will be removed too. This can't be undone." onConfirm={handleDelete} onCancel={() => setToDelete(null)} />
    </div>
  );
}

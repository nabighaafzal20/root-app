import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import HabitCheckItem from "../components/HabitCheckItem";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import { todayISO, formatFriendlyDate } from "../lib/id";
import { computeStreak } from "../lib/streaks";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();
  const { habits, tasks, projects, journal, isHabitDone, logsFor } = useData();

  const today = todayISO();
  const activeHabits = habits.filter((h) => !h.archived);
  const doneToday = activeHabits.filter((h) => isHabitDone(h.id, today)).length;
  const bestStreak = activeHabits.reduce((max, h) => Math.max(max, computeStreak(logsFor(h.id))), 0);

  const openTasks = tasks.filter((t) => t.status !== "done");
  const dueSoon = [...openTasks]
    .sort((a, b) => (a.dueDate || "9999") > (b.dueDate || "9999") ? 1 : -1)
    .slice(0, 5);

  const lastEntry = journal[0];

  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const entriesThisWeek = journal.filter((j) => new Date(j.date) >= weekAgo).length;

  function projectFor(taskId) {
    const t = tasks.find((x) => x.id === taskId);
    return projects.find((p) => p.id === t?.projectId);
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(" ")[0]}.</h1>
          <p className="page-sub">{formatFriendlyDate(today)}</p>
        </div>
        <Link to="/journal/new" className="btn btn-primary"><Icon name="plus" size={16} /> New entry</Link>
      </div>

      <div className="dash-stats">
        <div className="card stat-card">
          <div className="stat-value">{doneToday}/{activeHabits.length}</div>
          <div className="stat-label">Habits done today</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{bestStreak}</div>
          <div className="stat-label">Longest current streak</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{openTasks.length}</div>
          <div className="stat-label">Open tasks</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value">{entriesThisWeek}</div>
          <div className="stat-label">Journal entries this week</div>
        </div>
      </div>

      <div className="dash-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <h3>Today's habits</h3>
              <Link to="/habits" className="link-strong">Manage habits</Link>
            </div>
            {activeHabits.length === 0 ? (
              <EmptyState icon="target" title="No habits yet" message="Add a habit you want to build and check it off each day." />
            ) : (
              <div>{activeHabits.map((h) => <HabitCheckItem key={h.id} habit={h} date={today} />)}</div>
            )}
          </div>

          <div className="card">
            <div className="card-head">
              <h3>Up next</h3>
              <Link to="/projects" className="link-strong">All projects</Link>
            </div>
            {dueSoon.length === 0 ? (
              <EmptyState icon="layers" title="Nothing pending" message="Add a project and break it into small tasks." />
            ) : (
              dueSoon.map((t) => {
                const project = projectFor(t.id);
                return (
                  <div className="task-mini-row" key={t.id}>
                    <span className={`proj-dot proj-dot--${project?.color || "forest"}`} />
                    <span className="title">{t.title}</span>
                    {t.dueDate && <time>{t.dueDate}</time>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <h3>Latest reflection</h3>
              <Link to="/journal" className="link-strong">See all</Link>
            </div>
            {!lastEntry ? (
              <EmptyState icon="feather" title="No entries yet" message="Write down how today went." />
            ) : (
              <Link to={`/journal/${lastEntry.id}`} className="journal-preview" style={{ display: "block" }}>
                <span className="je-date">{formatFriendlyDate(lastEntry.date)}</span>
                <h4>{lastEntry.title || "Untitled entry"}</h4>
                <p>{lastEntry.content.replace(/<[^>]+>/g, " ").slice(0, 160)}…</p>
              </Link>
            )}
          </div>

          <div className="card" style={{ background: "var(--forest-dark)", color: "var(--gold-light)", border: "none" }}>
            <h3 style={{ color: "#FBF8EF", marginBottom: 8 }}>This week's rhythm</h3>
            <p style={{ fontSize: "0.87rem", lineHeight: 1.6, opacity: 0.85 }}>
              You've written {entriesThisWeek} {entriesThisWeek === 1 ? "entry" : "entries"} and kept a {bestStreak}-day streak going.
              Small, steady steps — that's what Root is for.
            </p>
            <Link to="/insights" className="btn btn-secondary" style={{ marginTop: 14, background: "rgba(255,255,255,0.1)", color: "#FBF8EF" }}>View insights</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

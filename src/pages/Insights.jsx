import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { useData } from "../context/DataContext";
import EmptyState from "../components/EmptyState";
import { last30Days, completionRate } from "../lib/streaks";
import { formatShortDate } from "../lib/id";

const MOOD_SCORE = { rough: 1, meh: 2, calm: 3, good: 4, great: 5 };
const MOOD_COLORS = { great: "var(--success)", good: "var(--forest)", calm: "var(--sky)", meh: "var(--gold)", rough: "var(--error)" };
const HABIT_COLORS = { forest: "var(--forest)", gold: "var(--gold)", clay: "var(--clay)", sky: "var(--sky)" };

export default function Insights() {
  const { journal, habits, habitLogs, projects, tasks } = useData();

  const days30 = last30Days();

  const moodSeries = useMemo(() => {
    const byDate = {};
    journal.forEach((j) => { byDate[j.date] = j; });
    return days30.map((d) => ({
      date: d,
      label: formatShortDate(d),
      mood: byDate[d] ? MOOD_SCORE[byDate[d].mood] : null,
    }));
  }, [journal, days30]);

  const habitRates = useMemo(() => {
    return habits.filter((h) => !h.archived).map((h) => {
      const logs = habitLogs.filter((l) => l.habitId === h.id).map((l) => l.date);
      return { ...h, rate: completionRate(logs, days30) };
    });
  }, [habits, habitLogs, days30]);

  const journalByWeek = useMemo(() => {
    const weeks = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i * 7 - 6);
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const count = journal.filter((j) => {
        const d = new Date(j.date + "T00:00:00");
        return d >= start && d <= end;
      }).length;
      weeks.push({ label: `${start.getMonth() + 1}/${start.getDate()}`, count });
    }
    return weeks;
  }, [journal]);

  const projectStats = useMemo(() => {
    return projects.filter((p) => !p.archived).map((p) => {
      const pt = tasks.filter((t) => t.projectId === p.id);
      const done = pt.filter((t) => t.status === "done").length;
      return { ...p, total: pt.length, done, pct: pt.length ? Math.round((done / pt.length) * 100) : 0 };
    });
  }, [projects, tasks]);

  const hasAnyData = journal.length > 0 || habits.length > 0 || projects.length > 0;

  if (!hasAnyData) {
    return (
      <div>
        <div className="page-head"><div><h1 className="page-title">Insights</h1><p className="page-sub">Patterns across your journal, habits and projects.</p></div></div>
        <EmptyState icon="chart" title="Not enough data yet" message="Write a few entries and check off some habits — your trends will show up here." />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Insights</h1>
          <p className="page-sub">The last 30 days across journal, habits and projects.</p>
        </div>
      </div>

      <div className="insights-grid">
        <div className="card insight-card" style={{ gridColumn: "1 / -1" }}>
          <h3>Mood over time</h3>
          <p className="sub">Each point is a journal entry's mood, mapped from rough to great.</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={moodSeries} margin={{ left: -20, right: 10 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" interval={4} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={20} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
                formatter={(v) => [Object.keys(MOOD_SCORE).find((k) => MOOD_SCORE[k] === v) || "—", "mood"]}
              />
              <Line type="monotone" dataKey="mood" stroke="var(--forest)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card insight-card">
          <h3>Habit consistency</h3>
          <p className="sub">Share of the last 30 days each habit was checked off.</p>
          {habitRates.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-light)" }}>No active habits yet.</p>
          ) : habitRates.map((h) => (
            <div className="habit-rate-row" key={h.id}>
              <span className="name">{h.name}</span>
              <span className="track"><span className="fill" style={{ width: `${h.rate}%`, background: HABIT_COLORS[h.color] }} /></span>
              <span className="pct">{h.rate}%</span>
            </div>
          ))}
        </div>

        <div className="card insight-card">
          <h3>Journal entries per week</h3>
          <p className="sub">The last six weeks.</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={journalByWeek} margin={{ left: -20, right: 10 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted)" }} axisLine={false} tickLine={false} width={20} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--gold)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card insight-card" style={{ gridColumn: "1 / -1" }}>
          <h3>Project progress</h3>
          <p className="sub">Tasks completed vs. total, per project.</p>
          {projectStats.length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted-light)" }}>No projects yet.</p>
          ) : projectStats.map((p) => (
            <div className="habit-rate-row" key={p.id}>
              <span className="name">{p.name}</span>
              <span className="track"><span className="fill" style={{ width: `${p.pct}%`, background: `var(--${p.color})` }} /></span>
              <span className="pct">{p.done}/{p.total}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

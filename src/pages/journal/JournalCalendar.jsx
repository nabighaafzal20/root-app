import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import { isoDate, todayISO } from "../../lib/id";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function JournalCalendar({ entries }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const navigate = useNavigate();

  const entriesByDate = useMemo(() => {
    const map = {};
    entries.forEach((e) => { map[e.date] = map[e.date] || []; map[e.date].push(e); });
    return map;
  }, [entries]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayISO();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function changeMonth(delta) {
    const d = new Date(cursor);
    d.setMonth(d.getMonth() + delta);
    setCursor(d);
  }

  function openDay(day) {
    const iso = isoDate(new Date(year, month, day));
    const dayEntries = entriesByDate[iso];
    if (dayEntries?.length) navigate(`/journal/${dayEntries[0].id}`);
    else navigate(`/journal/new?date=${iso}`);
  }

  return (
    <div className="card">
      <div className="cal-nav" style={{ justifyContent: "space-between", marginBottom: 16 }}>
        <button className="btn-icon" onClick={() => changeMonth(-1)} aria-label="Previous month"><Icon name="chevronLeft" size={18} /></button>
        <h3>{cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h3>
        <button className="btn-icon" onClick={() => changeMonth(1)} aria-label="Next month"><Icon name="chevronRight" size={18} /></button>
      </div>
      <div className="cal-grid">
        {WEEKDAYS.map((w) => <div key={w} className="cal-weekday">{w}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cal-cell is-empty" />;
          const iso = isoDate(new Date(year, month, day));
          const hasEntry = !!entriesByDate[iso];
          return (
            <button
              key={iso}
              className={`cal-cell ${hasEntry ? "has-entry" : ""} ${iso === today ? "is-today" : ""}`}
              onClick={() => openDay(day)}
              title={hasEntry ? `${entriesByDate[iso].length} entry` : "Write an entry"}
            >
              {day}
              {hasEntry && <span className="cal-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

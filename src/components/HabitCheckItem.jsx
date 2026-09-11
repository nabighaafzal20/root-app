import Icon from "./Icon";
import { useData } from "../context/DataContext";
import { computeStreak } from "../lib/streaks";

export default function HabitCheckItem({ habit, date }) {
  const { isHabitDone, toggleHabitLog, logsFor } = useData();
  const done = isHabitDone(habit.id, date);
  const streak = computeStreak(logsFor(habit.id));

  return (
    <div className={`habit-check-row ${done ? "is-done" : ""}`}>
      <button
        className="habit-check-toggle"
        onClick={() => toggleHabitLog(habit.id, date)}
        aria-pressed={done}
        aria-label={`Mark "${habit.name}" ${done ? "not done" : "done"}`}
      >
        {done && <Icon name="check" size={13} strokeWidth={3} />}
      </button>
      <span className={`habit-check-icon habit-check-icon--${habit.color}`}>
        <Icon name={habit.icon} size={15} />
      </span>
      <span className="habit-check-name">{habit.name}</span>
      {streak > 0 && (
        <span className="habit-check-streak">
          <Icon name="sparkle" size={13} /> {streak}
        </span>
      )}
    </div>
  );
}

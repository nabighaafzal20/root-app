import { addDays, todayISO } from "./id";

// logs: array of {habitId, date} for ONE habit
export function computeStreak(logDates) {
  const set = new Set(logDates);
  let streak = 0;
  let cursor = todayISO();
  // if today isn't logged yet, streak still counts back from yesterday
  if (!set.has(cursor)) cursor = addDays(cursor, -1);
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function computeBestStreak(logDates) {
  const sorted = [...new Set(logDates)].sort();
  if (sorted.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
  }
  return best;
}

export function last7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDays(todayISO(), -i));
  return days;
}

export function last30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) days.push(addDays(todayISO(), -i));
  return days;
}

export function completionRate(logDates, days) {
  const set = new Set(logDates);
  const hits = days.filter((d) => set.has(d)).length;
  return days.length ? Math.round((hits / days.length) * 100) : 0;
}

// =========================================================
// ROOT — localStorage data layer
// Everything in this app is stored in the browser only.
// Keys are namespaced per-user so multiple accounts on the
// same browser don't collide.
// =========================================================

const KEYS = {
  users: "root_users",
  session: "root_session",
  resetTokens: "root_reset_tokens",
  theme: "root_theme",
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function scoped(userId, name) {
  return `root_${name}_${userId}`;
}

/* ---------------- users / session ---------------- */

export const UsersDB = {
  all() {
    return read(KEYS.users, []);
  },
  save(users) {
    write(KEYS.users, users);
  },
  findByEmail(email) {
    return this.all().find((u) => u.email.toLowerCase() === email.toLowerCase());
  },
  findById(id) {
    return this.all().find((u) => u.id === id);
  },
  create(user) {
    const users = this.all();
    users.push(user);
    this.save(users);
    return user;
  },
  update(id, patch) {
    const users = this.all();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...patch };
    this.save(users);
    return users[idx];
  },
};

export const SessionDB = {
  get() {
    return read(KEYS.session, null);
  },
  set(session) {
    write(KEYS.session, session);
  },
  clear() {
    localStorage.removeItem(KEYS.session);
  },
};

export const ResetTokenDB = {
  all() {
    return read(KEYS.resetTokens, []);
  },
  save(list) {
    write(KEYS.resetTokens, list);
  },
  create(email, token) {
    const list = this.all().filter((t) => t.email !== email);
    const entry = { email, token, expiresAt: Date.now() + 1000 * 60 * 30 };
    list.push(entry);
    this.save(list);
    return entry;
  },
  find(token) {
    return this.all().find((t) => t.token === token && t.expiresAt > Date.now());
  },
  remove(token) {
    this.save(this.all().filter((t) => t.token !== token));
  },
};

export const ThemeDB = {
  get() {
    return localStorage.getItem(KEYS.theme) || "light";
  },
  set(theme) {
    localStorage.setItem(KEYS.theme, theme);
  },
};

/* ---------------- generic per-user collection helper ---------------- */

function makeCollection(name) {
  return {
    all(userId) {
      return read(scoped(userId, name), []);
    },
    save(userId, list) {
      write(scoped(userId, name), list);
    },
    create(userId, item) {
      const list = this.all(userId);
      list.unshift(item);
      this.save(userId, list);
      return item;
    },
    update(userId, id, patch) {
      const list = this.all(userId);
      const idx = list.findIndex((x) => x.id === id);
      if (idx === -1) return null;
      list[idx] = { ...list[idx], ...patch };
      this.save(userId, list);
      return list[idx];
    },
    remove(userId, id) {
      const list = this.all(userId).filter((x) => x.id !== id);
      this.save(userId, list);
    },
  };
}

export const JournalDB = makeCollection("journal_entries");
export const HabitsDB = makeCollection("habits");
export const HabitLogsDB = makeCollection("habit_logs");
export const ProjectsDB = makeCollection("projects");
export const TasksDB = makeCollection("tasks");
export const NotificationsDB = makeCollection("notifications");

/* ---------------- seed data for a brand new account ---------------- */

export function seedNewAccount(userId) {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);

  HabitsDB.save(userId, [
    { id: "h_read", name: "Read for 20 minutes", icon: "book", color: "forest", frequency: "daily", createdAt: Date.now(), archived: false },
    { id: "h_water", name: "Drink 8 glasses of water", icon: "droplet", color: "sky", frequency: "daily", createdAt: Date.now(), archived: false },
    { id: "h_move", name: "Move your body", icon: "leaf", color: "clay", frequency: "daily", createdAt: Date.now(), archived: false },
  ]);

  HabitLogsDB.save(userId, []);

  ProjectsDB.save(userId, [
    { id: "p_learn", name: "Learn a new skill", description: "Small steps toward something new.", color: "forest", collaborators: [], createdAt: Date.now(), archived: false },
  ]);

  TasksDB.save(userId, [
    { id: "t_1", projectId: "p_learn", title: "Pick what to learn", description: "", status: "todo", dueDate: null, createdAt: Date.now(), completedAt: null },
    { id: "t_2", projectId: "p_learn", title: "Find one good resource", description: "", status: "todo", dueDate: null, createdAt: Date.now(), completedAt: null },
  ]);

  JournalDB.save(userId, [
    {
      id: "j_welcome",
      date: iso(today),
      title: "Welcome to Root",
      content:
        "<p>This is your first entry. Root is a quiet place to write down your days, track the habits you're building, and move small projects forward — all in one spot.</p><p>Try checking off a habit or adding a task, then come back here and link it to today's entry.</p>",
      mood: "calm",
      tags: ["welcome"],
      linkedHabitIds: [],
      linkedTaskIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]);

  NotificationsDB.save(userId, [
    { id: "n_welcome", type: "info", message: "Welcome to Root — your growth workspace.", read: false, createdAt: Date.now() },
  ]);
}

/* ---------------- danger zone ---------------- */

export function wipeUserData(userId) {
  ["journal_entries", "habits", "habit_logs", "projects", "tasks", "notifications"].forEach((n) => {
    localStorage.removeItem(scoped(userId, n));
  });
}

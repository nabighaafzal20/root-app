import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  JournalDB, HabitsDB, HabitLogsDB, ProjectsDB, TasksDB, NotificationsDB,
} from "../lib/db";
import { uid, todayISO } from "../lib/id";
import { computeStreak } from "../lib/streaks";

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const uidUser = user?.id;

  const [journal, setJournal] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const reload = useCallback(() => {
    if (!uidUser) {
      setJournal([]); setHabits([]); setHabitLogs([]); setProjects([]); setTasks([]); setNotifications([]);
      return;
    }
    setJournal(JournalDB.all(uidUser));
    setHabits(HabitsDB.all(uidUser));
    setHabitLogs(HabitLogsDB.all(uidUser));
    setProjects(ProjectsDB.all(uidUser));
    setTasks(TasksDB.all(uidUser));
    setNotifications(NotificationsDB.all(uidUser));
  }, [uidUser]);

  useEffect(() => { reload(); }, [reload]);

  function notify(message, type = "info") {
    if (!uidUser) return;
    const item = { id: uid("notif"), type, message, read: false, createdAt: Date.now() };
    NotificationsDB.create(uidUser, item);
    setNotifications(NotificationsDB.all(uidUser));
  }

  /* ---------------- journal ---------------- */
  function addJournalEntry(entry) {
    const item = {
      id: uid("j"), date: todayISO(), title: "", content: "", mood: "calm",
      tags: [], linkedHabitIds: [], linkedTaskIds: [],
      createdAt: Date.now(), updatedAt: Date.now(), ...entry,
    };
    JournalDB.create(uidUser, item);
    setJournal(JournalDB.all(uidUser));
    return item;
  }
  function updateJournalEntry(id, patch) {
    JournalDB.update(uidUser, id, { ...patch, updatedAt: Date.now() });
    setJournal(JournalDB.all(uidUser));
  }
  function deleteJournalEntry(id) {
    JournalDB.remove(uidUser, id);
    setJournal(JournalDB.all(uidUser));
  }

  /* ---------------- habits ---------------- */
  function addHabit(habit) {
    const item = { id: uid("h"), color: "forest", icon: "leaf", frequency: "daily", archived: false, createdAt: Date.now(), ...habit };
    HabitsDB.create(uidUser, item);
    setHabits(HabitsDB.all(uidUser));
    notify(`New habit added: "${item.name}"`, "success");
    return item;
  }
  function updateHabit(id, patch) {
    HabitsDB.update(uidUser, id, patch);
    setHabits(HabitsDB.all(uidUser));
  }
  function deleteHabit(id) {
    HabitsDB.remove(uidUser, id);
    HabitLogsDB.save(uidUser, HabitLogsDB.all(uidUser).filter((l) => l.habitId !== id));
    setHabits(HabitsDB.all(uidUser));
    setHabitLogs(HabitLogsDB.all(uidUser));
  }
  function toggleHabitLog(habitId, date = todayISO()) {
    const logs = HabitLogsDB.all(uidUser);
    const existing = logs.find((l) => l.habitId === habitId && l.date === date);
    if (existing) {
      HabitLogsDB.remove(uidUser, existing.id);
    } else {
      const item = { id: uid("log"), habitId, date, createdAt: Date.now() };
      HabitLogsDB.create(uidUser, item);
      const habit = habits.find((h) => h.id === habitId);
      const newStreak = computeStreak(
        HabitLogsDB.all(uidUser).filter((l) => l.habitId === habitId).map((l) => l.date)
      );
      if (habit && [3, 7, 14, 30, 60, 100].includes(newStreak)) {
        notify(`${newStreak}-day streak on "${habit.name}" — nicely done.`, "success");
      }
    }
    setHabitLogs(HabitLogsDB.all(uidUser));
  }
  function isHabitDone(habitId, date = todayISO()) {
    return habitLogs.some((l) => l.habitId === habitId && l.date === date);
  }
  function logsFor(habitId) {
    return habitLogs.filter((l) => l.habitId === habitId).map((l) => l.date);
  }

  /* ---------------- projects / tasks ---------------- */
  function addProject(project) {
    const item = { id: uid("p"), color: "forest", collaborators: [], archived: false, description: "", createdAt: Date.now(), ...project };
    ProjectsDB.create(uidUser, item);
    setProjects(ProjectsDB.all(uidUser));
    return item;
  }
  function updateProject(id, patch) {
    ProjectsDB.update(uidUser, id, patch);
    setProjects(ProjectsDB.all(uidUser));
  }
  function deleteProject(id) {
    ProjectsDB.remove(uidUser, id);
    TasksDB.save(uidUser, TasksDB.all(uidUser).filter((t) => t.projectId !== id));
    setProjects(ProjectsDB.all(uidUser));
    setTasks(TasksDB.all(uidUser));
  }
  function addTask(task) {
    const item = { id: uid("t"), status: "todo", description: "", dueDate: null, completedAt: null, createdAt: Date.now(), ...task };
    TasksDB.create(uidUser, item);
    setTasks(TasksDB.all(uidUser));
    return item;
  }
  function updateTask(id, patch) {
    if (patch.status === "done" && !patch.completedAt) patch.completedAt = Date.now();
    if (patch.status && patch.status !== "done") patch.completedAt = null;
    TasksDB.update(uidUser, id, patch);
    setTasks(TasksDB.all(uidUser));
  }
  function deleteTask(id) {
    TasksDB.remove(uidUser, id);
    setTasks(TasksDB.all(uidUser));
  }

  /* ---------------- notifications ---------------- */
  function markNotificationRead(id) {
    NotificationsDB.update(uidUser, id, { read: true });
    setNotifications(NotificationsDB.all(uidUser));
  }
  function markAllNotificationsRead() {
    notifications.forEach((n) => NotificationsDB.update(uidUser, n.id, { read: true }));
    setNotifications(NotificationsDB.all(uidUser));
  }

  const value = {
    journal, habits, habitLogs, projects, tasks, notifications,
    reload, notify,
    addJournalEntry, updateJournalEntry, deleteJournalEntry,
    addHabit, updateHabit, deleteHabit, toggleHabitLog, isHabitDone, logsFor,
    addProject, updateProject, deleteProject, addTask, updateTask, deleteTask,
    markNotificationRead, markAllNotificationsRead,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

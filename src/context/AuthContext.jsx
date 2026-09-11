import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { UsersDB, SessionDB, ResetTokenDB, seedNewAccount, wipeUserData } from "../lib/db";
import { hashPassword, uid } from "../lib/id";

const AuthContext = createContext(null);

const AVATAR_PALETTE = ["forest", "gold", "clay", "sky"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = SessionDB.get();
    if (session) {
      const u = UsersDB.findById(session.userId);
      if (u) setUser(u);
      else SessionDB.clear();
    }
    setReady(true);
  }, []);

  async function signup({ name, email, password }) {
    if (UsersDB.findByEmail(email)) {
      throw new Error("An account with this email already exists.");
    }
    const passwordHash = await hashPassword(password);
    const newUser = {
      id: uid("user"),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      avatarColor: AVATAR_PALETTE[Math.floor(Math.random() * AVATAR_PALETTE.length)],
      bio: "",
      createdAt: Date.now(),
    };
    UsersDB.create(newUser);
    seedNewAccount(newUser.id);
    SessionDB.set({ userId: newUser.id, since: Date.now() });
    setUser(newUser);
    return newUser;
  }

  async function login({ email, password, remember }) {
    const found = UsersDB.findByEmail(email);
    if (!found) throw new Error("We couldn't find an account with that email.");
    const passwordHash = await hashPassword(password);
    if (passwordHash !== found.passwordHash) throw new Error("That password doesn't match.");
    SessionDB.set({ userId: found.id, since: Date.now(), remember: !!remember });
    setUser(found);
    return found;
  }

  function logout() {
    SessionDB.clear();
    setUser(null);
  }

  // Frontend-only demo: there's no email server, so "sending a reset email"
  // means generating a token and handing back a link you can open yourself.
  // See ForgotPassword.jsx for how this is surfaced to the user.
  function requestPasswordReset(email) {
    const found = UsersDB.findByEmail(email);
    if (!found) return null;
    const token = uid("reset");
    ResetTokenDB.create(found.email, token);
    return token;
  }

  async function resetPassword(token, newPassword) {
    const entry = ResetTokenDB.find(token);
    if (!entry) throw new Error("This reset link is invalid or has expired.");
    const found = UsersDB.findByEmail(entry.email);
    if (!found) throw new Error("Account not found.");
    const passwordHash = await hashPassword(newPassword);
    UsersDB.update(found.id, { passwordHash });
    ResetTokenDB.remove(token);
    return true;
  }

  async function updateProfile(patch) {
    if (!user) return;
    if (patch.newPassword) {
      const currentHash = await hashPassword(patch.currentPassword || "");
      if (currentHash !== user.passwordHash) throw new Error("Current password is incorrect.");
      patch = { ...patch, passwordHash: await hashPassword(patch.newPassword) };
    }
    delete patch.newPassword;
    delete patch.currentPassword;
    const updated = UsersDB.update(user.id, patch);
    setUser(updated);
    return updated;
  }

  function deleteAccount() {
    if (!user) return;
    wipeUserData(user.id);
    UsersDB.save(UsersDB.all().filter((u) => u.id !== user.id));
    SessionDB.clear();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, ready, signup, login, logout, requestPasswordReset, resetPassword, updateProfile, deleteAccount }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useData } from "../context/DataContext";
import { useToast } from "../context/ToastContext";
import Avatar from "../components/Avatar";
import ConfirmDialog from "../components/ConfirmDialog";

const COLORS = ["forest", "gold", "clay", "sky"];

export default function Profile() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { journal, habits, projects, tasks } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio || "");
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name: name.trim(), bio, avatarColor });
      showToast("Profile updated.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(e) {
    e.preventDefault();
    setPwError("");
    if (newPassword.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords don't match."); return; }
    setSavingPw(true);
    try {
      await updateProfile({ currentPassword, newPassword });
      showToast("Password changed.");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  }

  function exportData() {
    const payload = { user: { name: user.name, email: user.email }, journal, habits, projects, tasks, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "root-data-export.json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Data exported.");
  }

  function handleDeleteAccount() {
    deleteAccount();
    navigate("/login", { replace: true });
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Profile settings</h1>
          <p className="page-sub">Manage your account and how Root feels.</p>
        </div>
      </div>

      <div className="profile-grid">
        <div className="card profile-side">
          <Avatar name={name} color={avatarColor} size={72} />
          <h4>{user.name}</h4>
          <span>{user.email}</span>
          <span>Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div className="profile-section">
              <h3>Identity</h3>
              <p className="sub">Your name and avatar color are shown across Root.</p>
              <form onSubmit={saveProfile}>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label htmlFor="profName">Full name</label>
                  <input id="profName" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label htmlFor="profEmail">Email address</label>
                  <input id="profEmail" value={user.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label htmlFor="profBio">About you (optional)</label>
                  <textarea id="profBio" rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A short note to yourself." />
                </div>
                <div className="field" style={{ marginBottom: 18 }}>
                  <label>Avatar color</label>
                  <div className="color-swatch-picker">
                    {COLORS.map((c) => (
                      <button key={c} type="button" className={`color-dot-btn ${avatarColor === c ? "active" : ""}`} style={{ background: `var(--${c})` }} onClick={() => setAvatarColor(c)} aria-label={c} />
                    ))}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save changes"}</button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="profile-section">
              <h3>Change password</h3>
              <p className="sub">Choose something you haven't used elsewhere.</p>
              <form onSubmit={savePassword}>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label htmlFor="curPw">Current password</label>
                  <input id="curPw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label htmlFor="newPw">New password</label>
                  <input id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <div className="field" style={{ marginBottom: 14 }}>
                  <label htmlFor="confirmPw">Confirm new password</label>
                  <input id="confirmPw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
                </div>
                {pwError && <p className="field-error" style={{ marginBottom: 10 }}>{pwError}</p>}
                <button type="submit" className="btn btn-secondary" disabled={savingPw}>{savingPw ? "Updating…" : "Update password"}</button>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="profile-section">
              <h3>Preferences</h3>
              <p className="sub">How Root looks and lets you know things.</p>
              <div className="profile-row">
                <div>
                  <div className="profile-row-label">Dark mode</div>
                  <div className="profile-row-desc">Easier on the eyes in the evening.</div>
                </div>
                <button className={`toggle-switch ${theme === "dark" ? "on" : ""}`} onClick={toggleTheme} aria-pressed={theme === "dark"} aria-label="Toggle dark mode">
                  <span className="knob" />
                </button>
              </div>
              <div className="profile-row">
                <div>
                  <div className="profile-row-label">In-app notifications</div>
                  <div className="profile-row-desc">Streak milestones and reminders appear in the bell menu. Root has no server, so email notifications aren't available here.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="profile-section">
              <h3>Your data</h3>
              <p className="sub">Everything in Root lives only in this browser's local storage.</p>
              <div className="profile-row">
                <div>
                  <div className="profile-row-label">Export everything</div>
                  <div className="profile-row-desc">Download your journal, habits and projects as a JSON file.</div>
                </div>
                <button className="btn btn-secondary" onClick={exportData}>Export data</button>
              </div>
            </div>
          </div>

          <div className="danger-zone">
            <h3>Delete account</h3>
            <p className="sub" style={{ color: "var(--error)", opacity: 0.85 }}>This permanently removes your account and everything in it from this browser. There's no undo.</p>
            <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>Delete my account</button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        message="This removes your account and all journal entries, habits and projects from this browser. This can't be undone."
        confirmLabel="Delete account"
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

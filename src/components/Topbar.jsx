import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import Avatar from "./Avatar";
import SearchModal from "./SearchModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useData } from "../context/DataContext";

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      <button className="topbar-search" onClick={() => setSearchOpen(true)}>
        <Icon name="search" size={16} />
        Search Root…
        <kbd>/</kbd>
      </button>

      <div className="topbar-actions">
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
        </button>

        <div style={{ position: "relative" }}>
          <button className="btn-icon" style={{ position: "relative" }} onClick={() => { setNotifOpen((v) => !v); setProfileOpen(false); }} aria-label="Notifications">
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="notif-dot" />}
          </button>
          {notifOpen && (
            <>
              <div className="popover-overlay" onClick={() => setNotifOpen(false)} />
              <div className="popover-panel notif-panel">
                <div className="notif-head">
                  <h4>Notifications</h4>
                  {unread > 0 && <button className="link-muted" onClick={markAllNotificationsRead} style={{ fontSize: 12.5 }}>Mark all read</button>}
                </div>
                {notifications.length === 0 ? (
                  <p style={{ padding: 18, fontSize: 13.5, color: "var(--muted)" }}>You're all caught up.</p>
                ) : (
                  notifications.slice(0, 15).map((n) => (
                    <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`} onClick={() => markNotificationRead(n.id)}>
                      <div>
                        <p>{n.message}</p>
                        <time>{timeAgo(n.createdAt)}</time>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button className="btn-icon" onClick={() => { setProfileOpen((v) => !v); setNotifOpen(false); }} aria-label="Account menu">
            <Avatar name={user?.name} color={user?.avatarColor} size={30} />
          </button>
          {profileOpen && (
            <>
              <div className="popover-overlay" onClick={() => setProfileOpen(false)} />
              <div className="popover-panel profile-panel">
                <button className="menu-item" onClick={() => { navigate("/profile"); setProfileOpen(false); }}>
                  <Icon name="settings" size={16} /> Profile settings
                </button>
                <button className="menu-item danger" onClick={logout}>
                  <Icon name="logout" size={16} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

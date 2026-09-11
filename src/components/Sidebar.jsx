import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import Avatar from "./Avatar";
import { RootMark } from "./GrowthMark";
import { NAV_ITEMS } from "./navItems";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <RootMark />
        Root
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <NavLink to="/profile" className={({ isActive }) => `sidebar-user${isActive ? " active" : ""}`} style={{ textDecoration: "none" }}>
          <Avatar name={user?.name} color={user?.avatarColor} size={34} />
          <div className="sidebar-user-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}

import { NavLink } from "react-router-dom";
import Icon from "./Icon";
import { NAV_ITEMS } from "./navItems";

export default function MobileNav() {
  return (
    <nav className="mobile-nav">
      <div className="mobile-nav-inner">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `mobile-nav-link${isActive ? " active" : ""}`}
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

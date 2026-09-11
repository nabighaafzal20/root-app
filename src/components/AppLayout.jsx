import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="content-area">
          <Outlet />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}

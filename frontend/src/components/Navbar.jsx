import { useNavigate, useLocation } from "react-router-dom";
import { Boxes, Bell, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "../services/userService";
import { useTheme } from "../context/ThemeContext";

const PAGE_META = {
  "/dashboard": "Dashboard Overview",
  "/projects": "Managed Projects",
  "/teams": "Team Governance",
  "/sprints": "Sprint Planning",
  "/milestones": "Milestone Tracking",
  "/users/management": "User Management",
  "/users": "Registered Users",
  "/profile": "My Profile",
  "/cicd": "CI/CD Pipelines",
  "/testing": "Testing",
  "/releases": "Releases",
  "/monitoring": "Monitoring",
};

const getPageTitle = (pathname) => {
  const exact = PAGE_META[pathname];
  if (exact) return exact;
  const base = "/" + pathname.split("/")[1];
  return PAGE_META[base] || "NeuroForge Nexus";
};

const initials = (nameOrEmail = "") => {
  const clean = nameOrEmail.split("@")[0];
  return (
    clean
      .split(/[.\s_-]/)
      .filter(Boolean)
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="nf-navbar">
      <div className="nf-navbar-brand">
        <Boxes size={20} strokeWidth={2.4} />
        <span>NeuroForge Nexus</span>
      </div>

      <div className="nf-navbar-center">
        <div className="nf-navbar-title">{pageTitle}</div>
        <div className="nf-navbar-subtitle">
          Logged in as {user?.email || "guest"} • Role-customized workspace
        </div>
      </div>

      <div className="nf-navbar-tools">
        <button className="nf-theme-toggle" onClick={toggleTheme}>
          {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>

        <button className="nf-bell-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="nf-bell-dot" />
        </button>

        <div className="nf-user-block">
          <div className="nf-navbar-avatar" title={user?.name || user?.email || "User"}>
            {initials(user?.name || user?.email)}
          </div>
          <button className="nf-logout-btn" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
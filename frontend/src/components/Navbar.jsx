import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Boxes, Bell, LogOut } from "lucide-react";
import { getCurrentUser, logout } from "../services/userService";
import { useTheme } from "../context/ThemeContext";
import { getAllTasks } from "../services/taskService";

const PAGE_META = {
  "/dashboard": "Dashboard Overview",
  "/projects": "Managed Projects",
  "/teams": "Team Governance",
  "/sprints": "Sprint Planning",
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

  const [overdueTasks, setOverdueTasks] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef(null);

  // useEffect(() => {
  //   getAllTasks()
  //     .then((tasks) => {
  //       const today = new Date();
  //       today.setHours(0, 0, 0, 0);
  //       const overdue = (Array.isArray(tasks) ? tasks : []).filter((t) => {
  //         if (!t.dueDate || t.status === "Done") return false;
  //         return new Date(t.dueDate) < today;
  //       });
  //       setOverdueTasks(overdue);
  //     })
  //     .catch(() => setOverdueTasks([]));
  // }, [location.pathname]); // re-check whenever the user navigates, so it stays fresh
  useEffect(() => {
  const loadOverdue = () => {
    getAllTasks()
      .then((tasks) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdue = (Array.isArray(tasks) ? tasks : []).filter((t) => {
          if (!t.dueDate || t.status === "Done") return false;
          return new Date(t.dueDate) < today;
        });
        setOverdueTasks(overdue);
      })
      .catch(() => setOverdueTasks([]));
  };

  loadOverdue();
  const interval = setInterval(loadOverdue, 120000); // refresh every 2 minutes
  return () => clearInterval(interval);
}, []); // run once on mount, not on every navigation



  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <header className="nf-navbar">
      <div className="nf-navbar-brand">
        <span className="nf-brand-badge">
          <Boxes size={18} strokeWidth={2.4} />
        </span>
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

        <div className="nf-notif-wrap" ref={panelRef}>
          <button className="nf-bell-btn" aria-label="Notifications" onClick={() => setPanelOpen((o) => !o)}>
            <Bell size={18} />
            {overdueTasks.length > 0 && <span className="nf-bell-dot" />}
          </button>

          {panelOpen && (
            <div className="nf-notif-panel">
              <div className="nf-notif-panel-header">
                Notifications {overdueTasks.length > 0 && `(${overdueTasks.length})`}
              </div>

              {overdueTasks.length === 0 ? (
                <div className="nf-notif-empty">No overdue tasks — you're all caught up.</div>
              ) : (
                overdueTasks.map((t) => (
                  <div
                    key={t.id}
                    className="nf-notif-item"
                    onClick={() => {
                      setPanelOpen(false);
                      navigate(`/tasks/${t.id}`);
                    }}
                  >
                    <div className="nf-notif-item-title">{t.title}</div>
                    <div className="nf-notif-item-meta">
                      Overdue since {t.dueDate} — {t.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="nf-user-block">
          <div
            className="nf-navbar-avatar"
            title={user?.name || user?.email || "User"}
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          >
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
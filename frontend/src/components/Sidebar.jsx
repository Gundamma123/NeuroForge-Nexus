import { useLocation, useNavigate } from "react-router-dom";
import {
  FolderKanban, Users, UserCog, Rocket, Workflow,
  Activity, Bug, PackageCheck, Tag, Flag,
} from "lucide-react";

const MANAGEMENT_ITEMS = [
  { label: "Projects",        path: "/projects",          icon: FolderKanban },
  { label: "Teams",           path: "/teams",             icon: Users },
  { label: "Sprints",         path: "/sprints",           icon: Rocket },
  { label: "Milestones",      path: "/milestones",        icon: Flag },
  { label: "User Management", path: "/users/management",  icon: UserCog },
];

const DELIVERY_ITEMS = [
  { label: "Pipelines",    path: "/pipelines",    icon: Workflow },
  { label: "Deployments",  path: "/deployments",  icon: PackageCheck },
  { label: "Monitoring",   path: "/monitoring",   icon: Activity },
  { label: "Releases",     path: "/releases",     icon: Tag },
  { label: "Bug Tracker",  path: "/testing",      icon: Bug },
];

const DELIVERY_ROOTS = ["/pipelines", "/deployments", "/monitoring", "/releases", "/testing"];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isDelivery =
    location.pathname === "/delivery" ||
    DELIVERY_ROOTS.some((p) => location.pathname.startsWith(p));

  const activeItems = isDelivery ? DELIVERY_ITEMS : MANAGEMENT_ITEMS;
  const activeLabel = isDelivery ? "Delivery" : "Management";

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/dashboard" && path !== "/delivery" && location.pathname.startsWith(path + "/"));

  return (
    <aside className="nf-sidebar">
      {/* Dashboard toggle */}
      <div className="nf-dash-tabs" style={{ margin: "12px 10px 8px" }}>
        <button
          className={`nf-dash-tab${location.pathname === "/dashboard" ? " active" : ""}`}
          onClick={() => navigate("/dashboard")}
        >
          Project
        </button>
        <button
          className={`nf-dash-tab${location.pathname === "/delivery" ? " active" : ""}`}
          onClick={() => navigate("/delivery")}
        >
          Delivery
        </button>
      </div>

      {/* Nav group */}
      <nav className="nf-sidebar-nav">
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase", color: "var(--nf-text-faint)",
          padding: "10px 12px 4px",
        }}>
          {activeLabel}
        </div>
        {activeItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              className={`nf-sidebar-link${isActive(item.path) ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={16} className="nf-sidebar-icon" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

    </aside>
  );
};

export default Sidebar;

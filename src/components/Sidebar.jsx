import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Bug } from "lucide-react";
import { Bug } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Sprints", path: "/sprints" },
  { label: "Testing", path: "/testing", icon: Bug },
  { label: "User Management", path: "/users/management", icon: UserCog },
  { label: "CI/CD", path: "/cicd", icon: Workflow },
  { label: "Testing", path: "/testing", icon: Bug },
  { label: "Releases", path: "/releases", icon: Rocket },
  { label: "Monitoring", path: "/monitoring", icon: Activity },

];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="nf-sidebar">
      <nav>
        {NAV_ITEMS.map((item) => (
          <div
            key={item.path}
            className={`nf-sidebar-link ${
              location.pathname === item.path ? "active" : ""
            }`}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
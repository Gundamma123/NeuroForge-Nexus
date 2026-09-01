import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Rocket,
  Flag,
  UserCog,
  Workflow,
  TestTube,
  PackageCheck,
  Activity,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Teams", path: "/teams", icon: Users },
  { label: "Sprints", path: "/sprints", icon: Rocket },
  { label: "Milestones", path: "/milestones", icon: Flag },
  { label: "User Management", path: "/users/management", icon: UserCog },
  { label: "CI/CD", path: "/cicd", icon: Workflow },
  { label: "Testing", path: "/testing", icon: TestTube },
  { label: "Releases", path: "/releases", icon: PackageCheck },
  { label: "Monitoring", path: "/monitoring", icon: Activity },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="nf-sidebar">
      <nav>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.path}
              className={`nf-sidebar-link ${
                location.pathname === item.path ? "active" : ""
              }`}
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
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Projects", path: "/projects" },
  { label: "Sprints", path: "/sprints" },
  { label: "CI/CD", path: "/cicd" },
  { label: "Testing", path: "/testing" },
  { label: "Releases", path: "/releases" },
  { label: "Monitoring", path: "/monitoring" },
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
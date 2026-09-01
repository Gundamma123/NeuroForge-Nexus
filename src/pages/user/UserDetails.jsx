import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const ROLE_CLASS = {
  Admin: "role-admin",
  "Project Manager": "role-pm",
  Developer: "role-dev",
  Tester: "role-tester",
  "DevOps Engineer": "role-devops",
};

// Keycloak-issued RBAC permissions, shown per role for context.
const ROLE_PERMISSIONS = {
  Admin: ["Manage Users", "Manage Projects", "Manage Teams", "View Reports", "System Settings"],
  "Project Manager": ["Create Projects", "Plan Sprints", "Assign Tasks", "View Reports"],
  Developer: ["View Projects", "Update Tasks", "Push Code", "View CI/CD"],
  Tester: ["View Projects", "Log Defects", "Run Test Suites", "View CI/CD"],
  "DevOps Engineer": ["Manage Pipelines", "Deploy Releases", "View Monitoring", "Manage Infra"],
};

const FALLBACK_USER = {
  id: "0",
  name: "Unknown User",
  email: "—",
  role: "Developer",
  team: "—",
  status: "Active",
  joinedOn: "—",
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/users/${id}`)
      .then(({ data }) => {
        if (!cancelled) setUser(data);
      })
      .catch(() => {
        if (!cancelled) {
          setUser({ ...FALLBACK_USER, id });
          setError("Showing cached data — could not reach the User Service.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const initials = (name) =>
    name
      ?.split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  if (loading) {
    return (
      <div className="nf-app">
        <Navbar />
        <div className="nf-body">
          <Sidebar />
          <main className="nf-main">
            <div className="nf-loading">Loading user details...</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const permissions = ROLE_PERMISSIONS[user.role] || [];

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate("/users/management")}>
            ← Back to User Management
          </span>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-detail-header">
              <div className="nf-avatar">{initials(user.name)}</div>
              <div>
                <h2 className="nf-detail-name">{user.name}</h2>
                <div className="nf-detail-email">{user.email}</div>
              </div>
            </div>

            <div className="nf-detail-grid">
              <div className="nf-card">
                <div className="nf-stat-label">Role</div>
                <span className={`nf-badge ${ROLE_CLASS[user.role] || ""}`}>
                  {user.role}
                </span>
              </div>
              <div className="nf-card">
                <div className="nf-stat-label">Team</div>
                <div className="nf-detail-row" style={{ margin: 0 }}>{user.team}</div>
              </div>
              <div className="nf-card">
                <div className="nf-stat-label">Status</div>
                <span
                  className={`nf-status-dot ${user.status === "Active" ? "" : "inactive"}`}
                >
                  {user.status}
                </span>
              </div>
              <div className="nf-card">
                <div className="nf-stat-label">Joined</div>
                <div className="nf-detail-row" style={{ margin: 0 }}>
                  {user.joinedOn || "—"}
                </div>
              </div>
            </div>

            <h3>RBAC Permissions ({user.role})</h3>
            <div className="nf-permission-list">
              {permissions.map((perm) => (
                <span key={perm} className="nf-badge">
                  {perm}
                </span>
              ))}
            </div>

            <div className="nf-actions">
              <button className="nf-btn" onClick={() => navigate(`/users/${user.id}/edit`)}>
                Edit User
              </button>
              <button className="nf-btn secondary" onClick={() => navigate("/users/management")}>
                Back to List
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserDetails;
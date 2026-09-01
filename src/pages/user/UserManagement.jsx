import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const ROLES = ["Admin", "Project Manager", "Developer", "Tester", "DevOps Engineer"];

const ROLE_CLASS = {
  Admin: "role-admin",
  "Project Manager": "role-pm",
  Developer: "role-dev",
  Tester: "role-tester",
  "DevOps Engineer": "role-devops",
};

// Fallback data so the RBAC screen renders correctly even before the
// User Service / Keycloak-backed endpoint is live.
const FALLBACK_USERS = [
  { id: "1", name: "Admin User", email: "admin@neuroforge.io", role: "Admin", team: "Platform", status: "Active" },
  { id: "2", name: "Priya Nair", email: "priya.nair@neuroforge.io", role: "Project Manager", team: "FinCore Nexus", status: "Active" },
  { id: "3", name: "Arjun Mehta", email: "arjun.mehta@neuroforge.io", role: "Developer", team: "Backend", status: "Active" },
  { id: "4", name: "Sara Iqbal", email: "sara.iqbal@neuroforge.io", role: "Developer", team: "Frontend", status: "Active" },
  { id: "5", name: "Wei Chen", email: "wei.chen@neuroforge.io", role: "Tester", team: "QA", status: "Active" },
  { id: "6", name: "Diego Ruiz", email: "diego.ruiz@neuroforge.io", role: "DevOps Engineer", team: "DevOps", status: "Inactive" },
];

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get("/users")
      .then(({ data }) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setUsers(data);
      })
      .catch(() => {
        // User Service not reachable yet — keep fallback data
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All" || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const handleDeactivate = async (user) => {
    setActionError("");
    const nextStatus = user.status === "Active" ? "Inactive" : "Active";
    // optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );
    try {
      await api.put(`/users/${user.id}`, { ...user, status: nextStatus });
    } catch {
      // revert on failure
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u))
      );
      setActionError("Could not update user status. Please try again.");
    }
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">User Management</h1>

          {actionError && <div className="nf-form-error">{actionError}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <input
                className="nf-search-input"
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="nf-select-filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <button className="nf-btn" onClick={() => navigate("/register")}>
                + Add User
              </button>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Team</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="clickable"
                      onClick={() => navigate(`/users/${u.id}`)}
                    >
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`nf-badge ${ROLE_CLASS[u.role] || ""}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.team}</td>
                      <td>
                        <span
                          className={`nf-status-dot ${
                            u.status === "Active" ? "" : "inactive"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td>
                        <div
                          className="nf-table-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="nf-link-btn"
                            onClick={() => navigate(`/users/${u.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            className="nf-link-btn danger"
                            onClick={() => handleDeactivate(u)}
                          >
                            {u.status === "Active" ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && filteredUsers.length === 0 && (
                <div className="nf-empty-state">
                  No users match your search or filter.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserManagement;
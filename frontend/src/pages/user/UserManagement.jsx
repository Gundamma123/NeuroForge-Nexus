import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const ROLES = ["Admin", "Project Manager", "Developer", "Tester", "DevOps Engineer"];
const TEAMS = ["Unassigned", "Backend", "Frontend", "QA", "DevOps"];
const STATUSES = ["Active", "Inactive", "On Leave", "Suspended"];

const ROLE_CLASS = {
  Admin: "role-admin",
  "Project Manager": "role-pm",
  Developer: "role-dev",
  Tester: "role-tester",
  "DevOps Engineer": "role-devops",
};

const STATUS_CLASS = {
  Active: "status-active",
  Inactive: "status-inactive",
  "On Leave": "status-onleave",
  Suspended: "status-suspended",
};

const roleName = (role) => (typeof role === "string" ? role : role?.name || "—");

const FALLBACK_USERS = [
  { id: "1", name: "Admin User", email: "admin@neuroforge.io", role: "Admin", team: "Backend", status: "Active" },
  { id: "2", name: "Priya Nair", email: "priya.nair@neuroforge.io", role: "Project Manager", team: "Frontend", status: "Active" },
  { id: "3", name: "Arjun Mehta", email: "arjun.mehta@neuroforge.io", role: "Developer", team: "Backend", status: "Active" },
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
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const rName = roleName(u.role);
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "All" || rName === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const patchUser = async (user, changes) => {
    setActionError("");
    const prevUsers = users;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...changes } : u)));
    try {
      await api.put(`/users/${user.id}`, {
        name: user.name,
        email: user.email,
        role: roleName(user.role),
        team: (changes.team ?? user.team) === "Unassigned" ? null : (changes.team ?? user.team),
        status: changes.status ?? user.status,
      });
    } catch {
      setUsers(prevUsers);
      setActionError("Could not save that change. Please try again.");
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
                  <option key={r} value={r}>{r}</option>
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
                  {filteredUsers.map((u) => {
                    const rName = roleName(u.role);
                    const teamValue = u.team || "Unassigned";
                    const statusValue = u.status || "Active";
                    return (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`nf-badge ${ROLE_CLASS[rName] || ""}`}>{rName}</span>
                        </td>
                        <td>
                          <select
                            className="nf-inline-select"
                            value={teamValue}
                            onChange={(e) => patchUser(u, { team: e.target.value })}
                          >
                            {TEAMS.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            className={`nf-inline-select ${STATUS_CLASS[statusValue] || ""}`}
                            value={statusValue}
                            onChange={(e) => patchUser(u, { status: e.target.value })}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="nf-table-actions">
                            <button className="nf-link-btn" onClick={() => navigate(`/users/${u.id}`)}>
                              View
                            </button>
                            <button className="nf-link-btn" onClick={() => navigate(`/users/${u.id}/edit`)}>
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!loading && filteredUsers.length === 0 && (
                <div className="nf-empty-state">No users match your search or filter.</div>
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
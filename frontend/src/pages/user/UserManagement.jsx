// import { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Sidebar";
// import Footer from "../../components/Footer";
// import Modal from "../../components/Modal";
// import api from "../../services/api";

// const ROLES = [
//   "Admin",
//   "Project Manager",
//   "Developer",
//   "Tester",
//   "DevOps Engineer",
// ];

// const TEAMS = [
//   "Unassigned",
//   "Backend",
//   "Frontend",
//   "QA",
//   "DevOps",
// ];

// const STATUSES = [
//   "Active",
//   "Inactive",
//   "On Leave",
//   "Suspended",
// ];

// const ROLE_CLASS = {
//   Admin: "role-admin",
//   "Project Manager": "role-pm",
//   Developer: "role-dev",
//   Tester: "role-tester",
//   "DevOps Engineer": "role-devops",
// };

// const STATUS_CLASS = {
//   Active: "status-active",
//   Inactive: "status-inactive",
//   "On Leave": "status-onleave",
//   Suspended: "status-suspended",
// };

// const roleName = (role) =>
//   typeof role === "string" ? role : role?.name || "—";

// const FALLBACK_USERS = [
//   {
//     id: "1",
//     name: "Admin User",
//     email: "admin@neuroforge.io",
//     role: "Admin",
//     team: "Backend",
//     status: "Active",
//   },
//   {
//     id: "2",
//     name: "Priya Nair",
//     email: "priya.nair@neuroforge.io",
//     role: "Project Manager",
//     team: "Frontend",
//     status: "Active",
//   },
//   {
//     id: "3",
//     name: "Arjun Mehta",
//     email: "arjun.mehta@neuroforge.io",
//     role: "Developer",
//     team: "Backend",
//     status: "Active",
//   },
// ];

// const UserManagement = () => {
//   const navigate = useNavigate();

//   const [users, setUsers] = useState(FALLBACK_USERS);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [roleFilter, setRoleFilter] = useState("All");
//   const [actionError, setActionError] = useState("");
//   const [viewingUser, setViewingUser] = useState(null);

//   useEffect(() => {
//     let cancelled = false;

//     api
//       .get("/users")
//       .then(({ data }) => {
//         if (!cancelled && Array.isArray(data) && data.length > 0) {
//           setUsers(data);
//         }
//       })
//       .catch(() => {})
//       .finally(() => {
//         if (!cancelled) {
//           setLoading(false);
//         }
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const filteredUsers = useMemo(() => {
//     return users.filter((u) => {
//       const rName = roleName(u.role);

//       const userName = String(u.name || "").toLowerCase();
//       const userEmail = String(u.email || "").toLowerCase();
//       const searchValue = search.toLowerCase();

//       const matchesSearch =
//         userName.includes(searchValue) ||
//         userEmail.includes(searchValue);

//       const matchesRole =
//         roleFilter === "All" || rName === roleFilter;

//       return matchesSearch && matchesRole;
//     });
//   }, [users, search, roleFilter]);

//   const patchUser = async (user, changes) => {
//     setActionError("");

//     const prevUsers = users;

//     setUsers((prev) =>
//       prev.map((u) =>
//         u.id === user.id
//           ? { ...u, ...changes }
//           : u
//       )
//     );

//     try {
//       await api.put(`/users/${user.id}`, {
//         name: user.name,
//         email: user.email,
//         role: roleName(user.role),
//         team:
//           (changes.team ?? user.team) === "Unassigned"
//             ? null
//             : (changes.team ?? user.team),
//         status: changes.status ?? user.status,
//       });
//     } catch {
//       setUsers(prevUsers);
//       setActionError(
//         "Could not save that change. Please try again."
//       );
//     }
//   };

//   return (
//     <div className="nf-app">
//       <Navbar />

//       <div className="nf-body">
//         <Sidebar />

//         <main className="nf-main">
//           <h1 className="nf-page-title">
//             User Management
//           </h1>

//           {actionError && (
//             <div className="nf-form-error">
//               {actionError}
//             </div>
//           )}

//           <div className="nf-panel">
//             <div className="nf-toolbar">
//               <input
//                 className="nf-search-input"
//                 type="text"
//                 placeholder="Search by name or email..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />

//               <select
//                 className="nf-select-filter"
//                 value={roleFilter}
//                 onChange={(e) =>
//                   setRoleFilter(e.target.value)
//                 }
//               >
//                 <option value="All">All Roles</option>

//                 {ROLES.map((role) => (
//                   <option key={role} value={role}>
//                     {role}
//                   </option>
//                 ))}
//               </select>

//               <button
//                 className="nf-btn"
//                 onClick={() => navigate("/register")}
//               >
//                 + Add User
//               </button>
//             </div>

//             <div className="nf-table-wrap">
//               <table className="nf-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Role</th>
//                     <th>Team</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>

//                 <tbody>
//                   {filteredUsers.map((u) => {
//                     const rName = roleName(u.role);
//                     const teamValue =
//                       u.team || "Unassigned";
//                     const statusValue =
//                       u.status || "Active";

//                     return (
//                       <tr key={u.id}>
//                         <td>{u.name}</td>

//                         <td>{u.email}</td>

//                         <td>
//                           <span
//                             className={`nf-badge ${
//                               ROLE_CLASS[rName] || ""
//                             }`}
//                           >
//                             {rName}
//                           </span>
//                         </td>

//                         <td>
//                           <select
//                             className="nf-inline-select"
//                             value={teamValue}
//                             onChange={(e) =>
//                               patchUser(u, {
//                                 team: e.target.value,
//                               })
//                             }
//                           >
//                             {TEAMS.map((team) => (
//                               <option
//                                 key={team}
//                                 value={team}
//                               >
//                                 {team}
//                               </option>
//                             ))}
//                           </select>
//                         </td>

//                         <td>
//                           <select
//                             className={`nf-inline-select ${
//                               STATUS_CLASS[statusValue] || ""
//                             }`}
//                             value={statusValue}
//                             onChange={(e) =>
//                               patchUser(u, {
//                                 status: e.target.value,
//                               })
//                             }
//                           >
//                             {STATUSES.map((status) => (
//                               <option
//                                 key={status}
//                                 value={status}
//                               >
//                                 {status}
//                               </option>
//                             ))}
//                           </select>
//                         </td>

//                         <td>
//                           <div className="nf-table-actions">
//                             <button
//                               className="nf-link-btn"
//                               onClick={() =>
//                                 setViewingUser(u)
//                               }
//                             >
//                               View
//                             </button>

//                             <button
//                               className="nf-link-btn"
//                               onClick={() =>
//                                 navigate(
//                                   `/users/${u.id}/edit`
//                                 )
//                               }
//                             >
//                               Edit
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               {!loading &&
//                 filteredUsers.length === 0 && (
//                   <div className="nf-empty-state">
//                     No users match your search or filter.
//                   </div>
//                 )}
//             </div>
//           </div>
//         </main>
//       </div>

//       <Footer />

//       <Modal
//         open={!!viewingUser}
//         onClose={() => setViewingUser(null)}
//         title="User Details"
//       >
//         {viewingUser && (
//           <div className="nf-user-details">
//             <div className="nf-detail-row">
//               <strong>Name:</strong>
//               <span>{viewingUser.name || "—"}</span>
//             </div>

//             <div className="nf-detail-row">
//               <strong>Email:</strong>
//               <span>{viewingUser.email || "—"}</span>
//             </div>

//             <div className="nf-detail-row">
//               <strong>Role:</strong>
//               <span>
//                 {roleName(viewingUser.role)}
//               </span>
//             </div>

//             <div className="nf-detail-row">
//               <strong>Team:</strong>
//               <span>
//                 {viewingUser.team || "Unassigned"}
//               </span>
//             </div>

//             <div className="nf-detail-row">
//               <strong>Status:</strong>
//               <span>
//                 {viewingUser.status || "Active"}
//               </span>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// export default UserManagement;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Modal from "../../components/Modal";
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

const timeAgo = (iso) => {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "Never";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [actionError, setActionError] = useState("");
  const [viewingUser, setViewingUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/users")
      .then(({ data }) => { if (!cancelled) setUsers(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setActionError("Unable to load users from the server."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q);
      const matchesRole = roleFilter === "All" || roleName(u.role) === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const patchUser = async (user, changes) => {
    setActionError("");
    const previous = users;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...changes } : u)));
    const team = changes.team ?? user.team;
    try {
      await api.put(`/users/${user.id}`, {
        name: user.name,
        email: user.email,
        role: roleName(user.role),
        team: team === "Unassigned" ? null : team,
        status: changes.status ?? user.status,
      });
    } catch {
      setUsers(previous);
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
              <select className="nf-select-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Roles</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button className="nf-btn" onClick={() => navigate("/register")}>+ Add User</button>
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
                    <th>Last login</th>
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
                        <td><span className={`nf-badge ${ROLE_CLASS[rName] || ""}`}>{rName}</span></td>
                        <td>
                          <select
                            className="nf-inline-select"
                            value={teamValue}
                            onChange={(e) => patchUser(u, { team: e.target.value })}
                          >
                            {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </td>
                        <td>
                          <select
                            className={`nf-inline-select ${STATUS_CLASS[statusValue] || ""}`}
                            value={statusValue}
                            onChange={(e) => patchUser(u, { status: e.target.value })}
                          >
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td title={u.lastLoginAt || ""}>{timeAgo(u.lastLoginAt)}</td>
                        <td>
                          <div className="nf-table-actions">
                            <button className="nf-link-btn" onClick={() => setViewingUser(u)}>View</button>
                            <button className="nf-link-btn" onClick={() => navigate(`/users/${u.id}/edit`)}>Edit</button>
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

      <Modal open={!!viewingUser} onClose={() => setViewingUser(null)} title="User Details">
        <div className="nf-detail-header">
          <div className="nf-avatar">
            {(viewingUser?.name?.split(" ").map((p) => p?.[0]).join("").slice(0, 2) || "U").toUpperCase()}
          </div>
          <div>
            <h2 className="nf-detail-name">{viewingUser?.name ?? "Unknown User"}</h2>
            <div className="nf-detail-email">{viewingUser?.email ?? "—"}</div>
          </div>
        </div>

        <div className="nf-detail-grid">
          <div className="nf-card">
            <div className="nf-stat-label">Role</div>
            <span className="nf-badge">{roleName(viewingUser?.role)}</span>
          </div>
          <div className="nf-card">
            <div className="nf-stat-label">Team</div>
            <div className="nf-detail-row" style={{ margin: 0 }}>{viewingUser?.team ?? "Unassigned"}</div>
          </div>
          <div className="nf-card">
            <div className="nf-stat-label">Status</div>
            <span className={`nf-status-dot ${viewingUser?.status === "Active" ? "" : "inactive"}`}>
              {viewingUser?.status ?? "Unknown"}
            </span>
          </div>
          <div className="nf-card">
            <div className="nf-stat-label">Last login</div>
            <div className="nf-detail-row" style={{ margin: 0 }}>{timeAgo(viewingUser?.lastLoginAt)}</div>
          </div>
          <div className="nf-card">
            <div className="nf-stat-label">Joined</div>
            <div className="nf-detail-row" style={{ margin: 0 }}>{viewingUser?.joinedOn ?? "—"}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
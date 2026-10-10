// import { useEffect, useMemo, useState } from "react";
// import { Plus } from "lucide-react";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Sidebar";
// import Footer from "../../components/Footer";
// import BugFormModal from "../../components/bugs/BugFormModal";
// import BugDetailsModal from "../../components/bugs/BugDetailsModal";
// import { getAllProjects } from "../../services/projectService";
// import { getBugs, getBugStats, getBugAssignees } from "../../services/bugService";
// import { STATUSES, SEVERITIES, LEVEL_CLASS, statusClass, formatDate } from "../../utils/bugConstants";

// const BugTracker = () => {
//   const [bugs, setBugs] = useState([]);
//   const [stats, setStats] = useState({ total: 0, open: 0, critical: 0, closed: 0 });
//   const [projects, setProjects] = useState([]);
//   const [assignees, setAssignees] = useState([]);

//   const [filters, setFilters] = useState({ status: "", severity: "", projectId: "" });
//   const [search, setSearch] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [createOpen, setCreateOpen] = useState(false);
//   const [selectedBug, setSelectedBug] = useState(null);

//   const refreshStats = () => {
//     getBugStats().then(setStats).catch(() => {});
//   };

//   // Projects, assignees and stats load once
//   useEffect(() => {
//     getAllProjects().then((d) => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
//     getBugAssignees().then((d) => setAssignees(Array.isArray(d) ? d : [])).catch(() => {});
//     refreshStats();
//   }, []);

//   // The list reloads whenever a server-side filter changes
//   useEffect(() => {
//     let cancelled = false;
//     setLoading(true);
//     getBugs(filters)
//       .then((d) => {
//         if (cancelled) return;
//         setBugs(Array.isArray(d) ? d : []);
//         setError("");
//       })
//       .catch((err) => {
//         if (!cancelled) setError(err?.response?.data?.message || "Unable to load bugs.");
//       })
//       .finally(() => { if (!cancelled) setLoading(false); });
//     return () => { cancelled = true; };
//   }, [filters, reloadKey]);

//   const visible = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return bugs;
//     return bugs.filter((b) =>
//       [b.key, b.title, b.projectName, b.moduleFeature].some((v) => (v || "").toLowerCase().includes(q))
//     );
//   }, [bugs, search]);

//   const setFilter = (name, value) => setFilters((f) => ({ ...f, [name]: value }));

//   const handleCreated = () => {
//     setReloadKey((k) => k + 1);
//     refreshStats();
//   };

//   const handleChanged = (updated) => {
//     setBugs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
//     setSelectedBug(updated);
//     refreshStats();
//   };

//   const handleDeleted = (id) => {
//     setBugs((prev) => prev.filter((b) => b.id !== id));
//     setSelectedBug(null);
//     refreshStats();
//   };

//   return (
//     <div className="nf-app">
//       <Navbar />
//       <div className="nf-body">
//         <Sidebar />
//         <main className="nf-main">
//           <div className="nf-toolbar" style={{ marginBottom: 12 }}>
//             <div>
//               <h1 className="nf-page-title" style={{ marginBottom: 2 }}>Bug Reporting</h1>
//               <div className="nf-detail-row" style={{ margin: 0 }}>Track, manage and resolve software defects.</div>
//             </div>
//             <div style={{ flex: 1 }} />
//             <button className="nf-btn nf-github-connect-btn" onClick={() => setCreateOpen(true)}>
//               <Plus size={14} /> Report Bug
//             </button>
//           </div>

//           <div className="nf-stat-grid" style={{ marginBottom: 20 }}>
//             <div className="nf-card">
//               <div className="nf-stat-label">Total Bugs</div>
//               <div className="nf-stat-value">{stats.total}</div>
//             </div>
//             <div className="nf-card">
//               <div className="nf-stat-label">Open Bugs</div>
//               <div className="nf-stat-value">{stats.open}</div>
//             </div>
//             <div className="nf-card">
//               <div className="nf-stat-label">Critical</div>
//               <div className="nf-stat-value">{stats.critical}</div>
//             </div>
//             <div className="nf-card">
//               <div className="nf-stat-label">Closed</div>
//               <div className="nf-stat-value">{stats.closed}</div>
//             </div>
//           </div>

//           {error && <div className="nf-form-error">{error}</div>}

//           <div className="nf-panel">
//             <div className="nf-toolbar">
//               <input
//                 className="nf-search-input"
//                 placeholder="Search bugs, projects, modules..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//               <select className="nf-select-filter" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
//                 <option value="">All Statuses</option>
//                 {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
//               </select>
//               <select className="nf-select-filter" value={filters.severity} onChange={(e) => setFilter("severity", e.target.value)}>
//                 <option value="">All Severities</option>
//                 {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
//               </select>
//               <select className="nf-select-filter" value={filters.projectId} onChange={(e) => setFilter("projectId", e.target.value)}>
//                 <option value="">All Projects</option>
//                 {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
//               </select>
//             </div>

//             <div className="nf-table-wrap">
//               <table className="nf-table">
//                 <thead>
//                   <tr>
//                     <th>Bug</th>
//                     <th>Project</th>
//                     <th>Severity</th>
//                     <th>Priority</th>
//                     <th>Status</th>
//                     <th>Assigned</th>
//                     <th>Created</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {visible.map((b) => (
//                     <tr key={b.id} className="clickable" onClick={() => setSelectedBug(b)}>
//                       <td>
//                         <b>{b.key}</b>
//                         <div style={{ fontSize: 12, color: "var(--nf-text-dim)" }}>{b.title}</div>
//                       </td>
//                       <td>
//                         {b.projectName}
//                         {b.moduleFeature && (
//                           <div style={{ fontSize: 11.5, color: "var(--nf-text-faint)" }}>{b.moduleFeature}</div>
//                         )}
//                       </td>
//                       <td><span className={`nf-badge ${LEVEL_CLASS[b.severity] || ""}`}>{b.severity}</span></td>
//                       <td><span className={`nf-badge ${LEVEL_CLASS[b.priority] || ""}`}>{b.priority}</span></td>
//                       <td><span className={`nf-badge ${statusClass(b.status)}`}>{b.status}</span></td>
//                       <td>{b.assignedToName || "Unassigned"}</td>
//                       <td>{formatDate(b.createdAt)}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>

//               {loading && <div className="nf-loading" style={{ minHeight: 80 }}>Loading bugs...</div>}
//               {!loading && visible.length === 0 && (
//                 <div className="nf-empty-state">No bugs match your filters.</div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//       <Footer />

//       <BugFormModal
//         open={createOpen}
//         onClose={() => setCreateOpen(false)}
//         projects={projects}
//         assignees={assignees}
//         onCreated={handleCreated}
//       />

//       <BugDetailsModal
//         bug={selectedBug}
//         assignees={assignees}
//         onClose={() => setSelectedBug(null)}
//         onChanged={handleChanged}
//         onDeleted={handleDeleted}
//       />
//     </div>
//   );
// };

// export default BugTracker;
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import BugFormModal from "../../components/bugs/BugFormModal";
import BugDetailsModal from "../../components/bugs/BugDetailsModal";
import { getAllProjects } from "../../services/projectService";
import { getBugs, getBugStats, getBugAssignees } from "../../services/bugService";
import { STATUSES, SEVERITIES, LEVEL_CLASS, statusClass, formatDate } from "../../utils/bugConstants";

const BugTracker = () => {
  const [bugs, setBugs] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, critical: 0, closed: 0 });
  const [projects, setProjects] = useState([]);
  const [assignees, setAssignees] = useState([]);

  const [filters, setFilters] = useState({ status: "", severity: "", projectId: "" });
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState(null);

  const refreshStats = () => {
    getBugStats().then(setStats).catch(() => {});
  };

  // Projects, assignees and stats load once
  useEffect(() => {
    getAllProjects().then((d) => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
    getBugAssignees().then((d) => setAssignees(Array.isArray(d) ? d : [])).catch(() => {});
    refreshStats();
  }, []);

  // The list reloads whenever a server-side filter changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getBugs(filters)
      .then((d) => {
        if (cancelled) return;
        setBugs(Array.isArray(d) ? d : []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setBugs([]); // don't keep showing stale rows after a failed load
        setError(err?.response?.data?.message || "Unable to load bugs.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters, reloadKey]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return bugs;
    return bugs.filter((b) =>
      [b.key, b.title, b.projectName, b.moduleFeature].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [bugs, search]);

  const setFilter = (name, value) => setFilters((f) => ({ ...f, [name]: value }));

  const handleCreated = () => {
    setReloadKey((k) => k + 1);
    refreshStats();
  };

  const handleChanged = (updated) => {
    setBugs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBug(updated);
    refreshStats();
  };

  const handleDeleted = (id) => {
    setBugs((prev) => prev.filter((b) => b.id !== id));
    setSelectedBug(null);
    refreshStats();
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <div className="nf-toolbar" style={{ marginBottom: 12 }}>
            <div>
              <h1 className="nf-page-title" style={{ marginBottom: 2 }}>Bug Reporting</h1>
              <div className="nf-detail-row" style={{ margin: 0 }}>Track, manage and resolve software defects.</div>
            </div>
            <div style={{ flex: 1 }} />
            <button className="nf-btn nf-github-connect-btn" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> Report Bug
            </button>
          </div>

          <div className="nf-stat-grid" style={{ marginBottom: 20 }}>
            <div className="nf-card">
              <div className="nf-stat-label">Total Bugs</div>
              <div className="nf-stat-value">{stats.total}</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Open Bugs</div>
              <div className="nf-stat-value">{stats.open}</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Critical</div>
              <div className="nf-stat-value">{stats.critical}</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Closed</div>
              <div className="nf-stat-value">{stats.closed}</div>
            </div>
          </div>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <input
                className="nf-search-input"
                placeholder="Search bugs, projects, modules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="nf-select-filter" value={filters.status} onChange={(e) => setFilter("status", e.target.value)}>
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="nf-select-filter" value={filters.severity} onChange={(e) => setFilter("severity", e.target.value)}>
                <option value="">All Severities</option>
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="nf-select-filter" value={filters.projectId} onChange={(e) => setFilter("projectId", e.target.value)}>
                <option value="">All Projects</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Bug</th>
                    <th>Project</th>
                    <th>Severity</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b) => (
                    <tr key={b.id} className="clickable" onClick={() => setSelectedBug(b)}>
                      <td>
                        <b>{b.key}</b>
                        <div style={{ fontSize: 12, color: "var(--nf-text-dim)" }}>{b.title}</div>
                      </td>
                      <td>
                        {b.projectName}
                        {b.moduleFeature && (
                          <div style={{ fontSize: 11.5, color: "var(--nf-text-faint)" }}>{b.moduleFeature}</div>
                        )}
                      </td>
                      <td><span className={`nf-badge ${LEVEL_CLASS[b.severity] || ""}`}>{b.severity}</span></td>
                      <td><span className={`nf-badge ${LEVEL_CLASS[b.priority] || ""}`}>{b.priority}</span></td>
                      <td><span className={`nf-badge ${statusClass(b.status)}`}>{b.status}</span></td>
                      <td>{b.assignedToName || "Unassigned"}</td>
                      <td>{formatDate(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {loading && <div className="nf-loading" style={{ minHeight: 80 }}>Loading bugs...</div>}
              {!loading && !error && visible.length === 0 && (
                <div className="nf-empty-state">
                  {bugs.length === 0 ? "No bugs reported yet." : "No bugs match your filters."}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />

      <BugFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projects={projects}
        assignees={assignees}
        onCreated={handleCreated}
      />

      <BugDetailsModal
        bug={selectedBug}
        assignees={assignees}
        onClose={() => setSelectedBug(null)}
        onChanged={handleChanged}
        onDeleted={handleDeleted}
      />
    </div>
  );
};

export default BugTracker;

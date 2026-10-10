// import { useEffect, useMemo, useState } from "react";
// import Navbar from "../components/Navbar";
// import Sidebar from "../components/Sidebar";
// import Footer from "../components/Footer";
// import { getAllProjects } from "../services/projectService";
// import { getRepoLink, getRepoActivity } from "../services/githubService";

// const timeAgo = (iso) => {
//   if (!iso) return "—";
//   const diff = Date.now() - new Date(iso).getTime();
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1) return "just now";
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// };

// const statusOf = (run) => (run.status === "completed" ? run.conclusion : run.status);

// const Monitoring = () => {
//   const [rows, setRows] = useState([]); // [{ project, link, runs }]
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let cancelled = false;
//     getAllProjects()
//       .then(async (projects) => {
//         const list = Array.isArray(projects) ? projects : [];
//         const results = await Promise.all(
//           list.map(async (project) => {
//             try {
//               const link = await getRepoLink(project.id);
//               if (!link) return { project, link: null, runs: [] };
//               const runs = await getRepoActivity(project.id, "runs");
//               return { project, link, runs: Array.isArray(runs) ? runs : [] };
//             } catch {
//               return { project, link: null, runs: [] };
//             }
//           })
//         );
//         if (!cancelled) setRows(results);
//       })
//       .finally(() => { if (!cancelled) setLoading(false); });
//     return () => { cancelled = true; };
//   }, []);

//   const summary = useMemo(() => {
//     let monitored = 0;
//     let healthy = 0;
//     let critical = 0;

//     rows.forEach(({ link, runs }) => {
//       if (!link) return;
//       monitored += 1;
//       const latest = runs[0]; // GitHub returns most recent first
//       if (!latest) return;
//       const key = statusOf(latest);
//       if (key === "success") healthy += 1;
//       else if (key === "failure" || key === "cancelled" || key === "timed_out") critical += 1;
//     });

//     return { monitored, healthy, critical };
//   }, [rows]);

//   return (
//     <div className="nf-app">
//       <Navbar />
//       <div className="nf-body">
//         <Sidebar />
//         <main className="nf-main">
//           <h1 className="nf-page-title">Monitoring</h1>
//           <p className="nf-detail-row" style={{ marginTop: -8 }}>
//             Live pipeline health rolled up from each project's linked GitHub repository.
//           </p>

//           <div className="nf-stat-grid" style={{ marginBottom: 20 }}>
//             <div className="nf-card">
//               <div className="nf-stat-label">Pipelines Monitored</div>
//               <div className="nf-stat-value">{summary.monitored}</div>
//               <div className="nf-stat-tag">across all projects</div>
//             </div>
//             <div className="nf-card">
//               <div className="nf-stat-label">Healthy</div>
//               <div className="nf-stat-value">{summary.healthy}</div>
//               <div className="nf-stat-tag">reporting HEALTHY</div>
//             </div>
//             <div className="nf-card">
//               <div className="nf-stat-label">Critical</div>
//               <div className="nf-stat-value">{summary.critical}</div>
//               <div className="nf-stat-tag">need attention</div>
//             </div>
//           </div>

//           <h3 style={{ marginBottom: 10 }}>Pipeline health by project</h3>

//           {loading && <div className="nf-loading">Loading monitoring data...</div>}

//           {!loading && rows.map(({ project, link, runs }) => {
//             const latest = runs[0];
//             const key = latest ? statusOf(latest) : null;
//             const badgeClass =
//               key === "success" ? "status-done" :
//               key === "failure" || key === "cancelled" ? "status-todo" :
//               key === "in_progress" || key === "queued" ? "status-inprogress" : "";

//             return (
//               <div className="nf-panel" style={{ marginBottom: 14 }} key={project.id}>
//                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                   <div>
//                     <b>{project.name}</b>
//                     {link && <span style={{ color: "var(--nf-text-faint)", fontSize: 12, marginLeft: 8 }}>
//                       {link.repoOwner}/{link.repoName}
//                     </span>}
//                   </div>
//                   <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>{runs.length} pipelines</span>
//                 </div>

//                 {!link ? (
//                   <div className="nf-empty-state">No repository linked to this project.</div>
//                 ) : runs.length === 0 ? (
//                   <div className="nf-empty-state">No pipelines found for this project.</div>
//                 ) : (
//                   <div className="nf-detail-row" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
//                     <span className={`nf-badge ${badgeClass}`}>{key || "unknown"}</span>
//                     <span>{latest.name}</span>
//                     <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>
//                       {latest.branch} · {timeAgo(latest.createdAt)}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default Monitoring;
import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { getAllProjects } from "../services/projectService";
import { getRepoLink, getRepoActivity } from "../services/githubService";

const timeAgo = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const statusOf = (run) => (run.status === "completed" ? run.conclusion : run.status);

const FAILED = ["failure", "cancelled", "timed_out"];
const RUNNING = ["in_progress", "queued"];

const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

const Monitoring = () => {
  // [{ project, link, runs, error }]
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const projects = await getAllProjects();
      const list = (Array.isArray(projects) ? projects : []).filter((p) => p && p.id != null);

      const results = await Promise.all(
        list.map(async (project) => {
          // 1) Is a repository linked?
          let link = null;
          try {
            link = await getRepoLink(project.id);
          } catch (err) {
            return {
              project, link: null, runs: [],
              error: errorMessage(err, "Could not check the linked repository."),
            };
          }
          if (!link) return { project, link: null, runs: [], error: "" };

          // 2) Load the workflow runs. A failure here is NOT "no repository linked".
          try {
            const runs = await getRepoActivity(project.id, "runs");
            return { project, link, runs: Array.isArray(runs) ? runs : [], error: "" };
          } catch (err) {
            return {
              project, link, runs: [],
              error: errorMessage(err, "Could not load pipelines from GitHub."),
            };
          }
        })
      );
      setRows(results);
    } catch (err) {
      setRows([]);
      setError(errorMessage(err, "Unable to load projects."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    let monitored = 0;
    let healthy = 0;
    let critical = 0;

    rows.forEach(({ link, runs, error: rowError }) => {
      if (!link || rowError) return;
      monitored += 1;
      const latest = runs[0]; // GitHub returns the most recent run first
      if (!latest) return;
      const key = statusOf(latest);
      if (key === "success") healthy += 1;
      else if (FAILED.includes(key)) critical += 1;
    });

    return { monitored, healthy, critical };
  }, [rows]);

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <div className="nf-toolbar" style={{ marginBottom: 12 }}>
            <div>
              <h1 className="nf-page-title" style={{ marginBottom: 2 }}>Monitoring</h1>
              <div className="nf-detail-row" style={{ margin: 0 }}>
                Live pipeline health rolled up from each project's linked GitHub repository.
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button className="nf-btn" onClick={load} disabled={loading}>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="nf-stat-grid" style={{ marginBottom: 20 }}>
            <div className="nf-card">
              <div className="nf-stat-label">Pipelines Monitored</div>
              <div className="nf-stat-value">{summary.monitored}</div>
              <div className="nf-stat-tag">across all projects</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Healthy</div>
              <div className="nf-stat-value">{summary.healthy}</div>
              <div className="nf-stat-tag">latest run passed</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Critical</div>
              <div className="nf-stat-value">{summary.critical}</div>
              <div className="nf-stat-tag">need attention</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 10 }}>Pipeline health by project</h3>

          {error && <div className="nf-form-error">{error}</div>}
          {loading && <div className="nf-loading">Loading monitoring data...</div>}

          {!loading && !error && rows.length === 0 && (
            <div className="nf-empty-state">No projects found.</div>
          )}

          {!loading &&
            rows.map(({ project, link, runs, error: rowError }) => {
              const latest = runs[0];
              const key = latest ? statusOf(latest) : null;
              const badgeClass =
                key === "success" ? "status-done" :
                FAILED.includes(key) ? "status-todo" :
                RUNNING.includes(key) ? "status-inprogress" : "";

              return (
                <div className="nf-panel" style={{ marginBottom: 14 }} key={project.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <b>{project.name}</b>
                      {link && (
                        <span style={{ color: "var(--nf-text-faint)", fontSize: 12, marginLeft: 8 }}>
                          {link.repoOwner}/{link.repoName}
                        </span>
                      )}
                    </div>
                    {link && !rowError && (
                      <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>
                        {runs.length} recent runs
                      </span>
                    )}
                  </div>

                  {rowError ? (
                    <div className="nf-empty-state" style={{ marginTop: 10, color: "var(--nf-text-faint)", fontSize: 12 }}>
                      No pipeline data available for this repository.
                    </div>
                  ) : !link ? (
                    <div className="nf-empty-state">No repository linked to this project.</div>
                  ) : runs.length === 0 ? (
                    <div className="nf-empty-state">No pipeline runs found for this project.</div>
                  ) : (
                    <div
                      className="nf-detail-row"
                      style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span className={`nf-badge ${badgeClass}`}>{key || "unknown"}</span>
                      <span>{latest.name}</span>
                      <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>
                        {latest.branch} · {timeAgo(latest.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Monitoring;

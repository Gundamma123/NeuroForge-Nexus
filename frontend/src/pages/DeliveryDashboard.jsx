import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCw, AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { getAllProjects } from "../services/projectService";
import { getRepoLink, getRepoActivity } from "../services/githubService";
import { getBugStats } from "../services/bugService";

const timeAgo = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "—";
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
const RUN_BADGE = { success: "status-done", failure: "status-todo", cancelled: "status-todo", timed_out: "status-todo", in_progress: "status-inprogress", queued: "status-inprogress" };
const ENV_BADGE = { success: "status-done", failure: "status-todo", error: "status-todo", in_progress: "status-inprogress", pending: "status-inprogress" };
const normalizeEnv = (raw) => {
  const e = (raw || "").toLowerCase();
  if (e.includes("prod")) return "production";
  if (e.includes("stag")) return "staging";
  return "dev";
};

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState([]);
  const [bugStats, setBugStats] = useState({ total: 0, open: 0, critical: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [projects, bStats] = await Promise.all([
        getAllProjects(),
        getBugStats().catch(() => ({ total: 0, open: 0, critical: 0, closed: 0 })),
      ]);
      setBugStats(bStats);
      const list = Array.isArray(projects) ? projects : [];
      const results = await Promise.all(
        list.map(async (project) => {
          let link = null;
          try { link = await getRepoLink(project.id); } catch { /* no link */ }
          if (!link) return { project, link: null, runs: [], deployments: [] };
          const [runs, deployments] = await Promise.all([
            getRepoActivity(project.id, "runs").catch(() => []),
            getRepoActivity(project.id, "deployments").catch(() => []),
          ]);
          return { project, link, runs: Array.isArray(runs) ? runs : [], deployments: Array.isArray(deployments) ? deployments : [] };
        })
      );
      setProjectData(results);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load delivery data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const summary = useMemo(() => {
    let totalRuns = 0, successRuns = 0, failedRuns = 0, runningRuns = 0;
    let totalDeploys = 0, liveDeploys = 0, failedDeploys = 0;
    const failedPipelines = [];
    projectData.forEach(({ project, link, runs, deployments }) => {
      if (!link) return;
      totalRuns += runs.length;
      runs.forEach((r) => {
        const key = statusOf(r);
        if (key === "success") successRuns++;
        else if (FAILED.includes(key)) failedRuns++;
        else if (RUNNING.includes(key)) runningRuns++;
      });
      const latestFailed = runs.find((r) => FAILED.includes(statusOf(r)));
      if (latestFailed) failedPipelines.push({ project, run: latestFailed });
      totalDeploys += deployments.length;
      deployments.forEach((d) => {
        if (d.state === "success") liveDeploys++;
        if (d.state === "failure" || d.state === "error") failedDeploys++;
      });
    });
    const successRate = totalRuns > 0 ? Math.round((successRuns / totalRuns) * 100) : null;
    return { totalRuns, successRuns, failedRuns, runningRuns, successRate, totalDeploys, liveDeploys, failedDeploys, failedPipelines };
  }, [projectData]);

  const linkedProjects = projectData.filter((r) => r.link);
  const unlinkedCount = projectData.length - linkedProjects.length;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <div className="nf-toolbar" style={{ marginBottom: 4 }}>
            <div>
              <h1 className="nf-page-title" style={{ marginBottom: 2 }}>Delivery Dashboard</h1>
              <div className="nf-detail-row" style={{ margin: 0 }}>
                Pipelines · Deployments · Monitoring · Bugs — live from GitHub &amp; NeuroForge
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button className="nf-btn" onClick={() => load(true)} disabled={refreshing}>
              <RotateCw size={13} /> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {error && <div className="nf-form-error" style={{ marginTop: 12 }}>{error}</div>}
          {loading && <div className="nf-loading" style={{ marginTop: 16 }}>Loading delivery data...</div>}

          {!loading && (
            <>
              <div className="nf-stat-grid" style={{ marginTop: 16 }}>
                <div className="nf-card" style={{ cursor: "pointer" }} onClick={() => navigate("/pipelines")}>
                  <div className="nf-stat-label">Pipeline Runs</div>
                  <div className="nf-stat-value">{summary.totalRuns}</div>
                  <div className="nf-stat-tag">{summary.successRate !== null ? `${summary.successRate}% success rate` : "no runs yet"}</div>
                </div>
                <div className="nf-card" style={{ cursor: "pointer" }} onClick={() => navigate("/pipelines")}>
                  <div className="nf-stat-label">Passed</div>
                  <div className="nf-stat-value" style={{ color: "var(--nf-success, #22c55e)" }}>{summary.successRuns}</div>
                  <div className="nf-stat-tag">successful runs</div>
                </div>
                <div className="nf-card" style={{ cursor: "pointer" }} onClick={() => navigate("/pipelines")}>
                  <div className="nf-stat-label">Failed</div>
                  <div className="nf-stat-value" style={{ color: summary.failedRuns > 0 ? "var(--nf-danger, #ef4444)" : undefined }}>{summary.failedRuns}</div>
                  <div className="nf-stat-tag">need attention</div>
                </div>
                <div className="nf-card" style={{ cursor: "pointer" }} onClick={() => navigate("/deployments")}>
                  <div className="nf-stat-label">Deployments</div>
                  <div className="nf-stat-value">{summary.totalDeploys}</div>
                  <div className="nf-stat-tag">{summary.liveDeploys} live</div>
                </div>
                <div className="nf-card" style={{ cursor: "pointer" }} onClick={() => navigate("/deployments")}>
                  <div className="nf-stat-label">Deploy Failures</div>
                  <div className="nf-stat-value" style={{ color: summary.failedDeploys > 0 ? "var(--nf-danger, #ef4444)" : undefined }}>{summary.failedDeploys}</div>
                  <div className="nf-stat-tag">failed environments</div>
                </div>
                <div className="nf-card" style={{ cursor: "pointer" }} onClick={() => navigate("/testing")}>
                  <div className="nf-stat-label">Open Bugs</div>
                  <div className="nf-stat-value">{bugStats.open}</div>
                  <div className="nf-stat-tag">{bugStats.critical} critical</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
                <div className="nf-panel">
                  <div className="nf-toolbar">
                    <h3 style={{ margin: 0 }}>Pipeline Health</h3>
                    <button className="nf-link-btn" onClick={() => navigate("/pipelines")}>View all</button>
                  </div>
                  {linkedProjects.length === 0
                    ? <div className="nf-empty-state">No projects have a linked GitHub repository.</div>
                    : linkedProjects.map(({ project, runs }) => {
                      const latest = runs[0];
                      const key = latest ? statusOf(latest) : null;
                      const Icon = key === "success" ? CheckCircle : FAILED.includes(key) ? XCircle : RUNNING.includes(key) ? Clock : AlertTriangle;
                      return (
                        <div key={project.id} className="nf-detail-row"
                          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                          onClick={() => navigate("/pipelines")}>
                          <Icon size={14} />
                          <span style={{ flex: 1 }}><b>{project.name}</b></span>
                          {key
                            ? <span className={`nf-badge ${RUN_BADGE[key] || ""}`}>{key}</span>
                            : <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>no runs</span>}
                          {latest && <span style={{ color: "var(--nf-text-faint)", fontSize: 11 }}>{timeAgo(latest.createdAt)}</span>}
                        </div>
                      );
                    })
                  }
                  {unlinkedCount > 0 && (
                    <div style={{ color: "var(--nf-text-faint)", fontSize: 12, marginTop: 8 }}>
                      {unlinkedCount} project{unlinkedCount > 1 ? "s" : ""} without a linked repository.
                    </div>
                  )}
                </div>

                <div className="nf-panel">
                  <div className="nf-toolbar">
                    <h3 style={{ margin: 0 }}>Latest Deployments</h3>
                    <button className="nf-link-btn" onClick={() => navigate("/deployments")}>View all</button>
                  </div>
                  {linkedProjects.length === 0
                    ? <div className="nf-empty-state">No projects have a linked GitHub repository.</div>
                    : linkedProjects.map(({ project, deployments }) => {
                      const byEnv = ["production", "staging", "dev"].reduce((acc, env) => {
                        acc[env] = deployments.filter((d) => normalizeEnv(d.environment) === env)
                          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
                        return acc;
                      }, {});
                      const latest = byEnv.production || byEnv.staging || byEnv.dev;
                      return (
                        <div key={project.id} className="nf-detail-row"
                          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
                          onClick={() => navigate("/deployments")}>
                          <span style={{ flex: 1 }}><b>{project.name}</b></span>
                          {latest
                            ? <>
                                <span style={{ fontSize: 11, color: "var(--nf-text-faint)" }}>{(latest.environment || "").toUpperCase()}</span>
                                <span className={`nf-badge ${ENV_BADGE[latest.state] || ""}`}>{latest.state}</span>
                              </>
                            : <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>no deployments</span>}
                        </div>
                      );
                    })
                  }
                </div>
              </div>

              {summary.failedPipelines.length > 0 && (
                <div className="nf-panel" style={{ marginTop: 20 }}>
                  <div className="nf-toolbar">
                    <h3 style={{ margin: 0, color: "var(--nf-danger, #ef4444)" }}>
                      <XCircle size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Failed Pipelines
                    </h3>
                    <button className="nf-link-btn" onClick={() => navigate("/pipelines")}>View all</button>
                  </div>
                  <div className="nf-table-wrap">
                    <table className="nf-table">
                      <thead><tr><th>Project</th><th>Workflow</th><th>Branch</th><th>Status</th><th>When</th></tr></thead>
                      <tbody>
                        {summary.failedPipelines.map(({ project, run }) => (
                          <tr key={`${project.id}-${run.id}`}>
                            <td><b>{project.name}</b></td>
                            <td>{run.name}</td>
                            <td>{run.branch}</td>
                            <td><span className={`nf-badge ${RUN_BADGE[statusOf(run)] || ""}`}>{statusOf(run)}</span></td>
                            <td>{timeAgo(run.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="nf-panel" style={{ marginTop: 20 }}>
                <div className="nf-toolbar">
                  <h3 style={{ margin: 0 }}>Monitoring Overview</h3>
                  <button className="nf-link-btn" onClick={() => navigate("/monitoring")}>Full view</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  <div className="nf-card">
                    <div className="nf-stat-label">Projects Monitored</div>
                    <div className="nf-stat-value">{linkedProjects.length}</div>
                    <div className="nf-stat-tag">with linked repos</div>
                  </div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Healthy Pipelines</div>
                    <div className="nf-stat-value" style={{ color: "var(--nf-success, #22c55e)" }}>
                      {linkedProjects.filter(({ runs }) => runs[0] && statusOf(runs[0]) === "success").length}
                    </div>
                    <div className="nf-stat-tag">latest run passed</div>
                  </div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Running Now</div>
                    <div className="nf-stat-value">{summary.runningRuns}</div>
                    <div className="nf-stat-tag">in_progress / queued</div>
                  </div>
                </div>
              </div>

              <div className="nf-panel" style={{ marginTop: 20 }}>
                <div className="nf-toolbar">
                  <h3 style={{ margin: 0 }}>Bug Tracker Summary</h3>
                  <button className="nf-link-btn" onClick={() => navigate("/testing")}>Open tracker</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  <div className="nf-card"><div className="nf-stat-label">Total Bugs</div><div className="nf-stat-value">{bugStats.total}</div></div>
                  <div className="nf-card"><div className="nf-stat-label">Open</div><div className="nf-stat-value">{bugStats.open}</div></div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Critical</div>
                    <div className="nf-stat-value" style={{ color: bugStats.critical > 0 ? "var(--nf-danger, #ef4444)" : undefined }}>{bugStats.critical}</div>
                  </div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Closed</div>
                    <div className="nf-stat-value" style={{ color: "var(--nf-success, #22c55e)" }}>{bugStats.closed}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DeliveryDashboard;

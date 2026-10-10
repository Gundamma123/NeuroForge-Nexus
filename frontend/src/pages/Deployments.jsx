import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { getAllProjects } from "../services/projectService";
import { getRepoLink, getRepoActivity } from "../services/githubService";

const ENVIRONMENTS = ["dev", "staging", "production"];
const ENV_LABEL = { dev: "DEV", staging: "STAGING", production: "PROD" };
const STATE_CLASS = { success: "status-done", failure: "status-todo", error: "status-todo", in_progress: "status-inprogress", pending: "status-inprogress" };

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

// GitHub environments aren't always lowercase "dev"/"staging"/"production" —
// normalize common variants so they land in the right column.
const normalizeEnv = (raw) => {
  const e = (raw || "").toLowerCase();
  if (e.includes("prod")) return "production";
  if (e.includes("stag")) return "staging";
  return "dev";
};

const Deployments = () => {
  const [rows, setRows] = useState([]); // [{ project, link, deployments }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllProjects()
      .then(async (projects) => {
        const list = Array.isArray(projects) ? projects : [];
        const results = await Promise.all(
          list.map(async (project) => {
            try {
              const link = await getRepoLink(project.id);
              if (!link) return { project, link: null, deployments: [] };
              const deployments = await getRepoActivity(project.id, "deployments");
              return { project, link, deployments: Array.isArray(deployments) ? deployments : [] };
            } catch {
              return { project, link: null, deployments: [] };
            }
          })
        );
        if (!cancelled) setRows(results);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => {
    let total = 0;
    let live = 0;
    let failed = 0;
    rows.forEach(({ deployments }) => {
      total += deployments.length;
      deployments.forEach((d) => {
        if (d.state === "success") live += 1;
        if (d.state === "failure" || d.state === "error") failed += 1;
      });
    });
    return { total, live, failed };
  }, [rows]);

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Deployments</h1>
          <p className="nf-detail-row" style={{ marginTop: -8 }}>
            Environment status and deployment history, pulled live from each project's linked repository.
          </p>

          <div className="nf-stat-grid" style={{ marginBottom: 20 }}>
            <div className="nf-card">
              <div className="nf-stat-label">Total Deployments</div>
              <div className="nf-stat-value">{totals.total}</div>
              <div className="nf-stat-tag">across all projects</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Currently Live</div>
              <div className="nf-stat-value">{totals.live}</div>
              <div className="nf-stat-tag">active deployments</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Failed</div>
              <div className="nf-stat-value">{totals.failed}</div>
              <div className="nf-stat-tag">need attention</div>
            </div>
          </div>

          <h3 style={{ marginBottom: 10 }}>Deployments by project</h3>

          {loading && <div className="nf-loading">Loading deployments...</div>}

          {!loading && rows.map(({ project, link, deployments }) => {
            const byEnv = ENVIRONMENTS.reduce((acc, env) => {
              acc[env] = deployments
                .filter((d) => normalizeEnv(d.environment) === env)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
              return acc;
            }, {});

            return (
              <div className="nf-panel" style={{ marginBottom: 14 }} key={project.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <b>{project.name}</b>
                  <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>{deployments.length} deployments</span>
                </div>

                {!link ? (
                  <div className="nf-empty-state">No repository linked to this project.</div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                    {ENVIRONMENTS.map((env) => {
                      const d = byEnv[env];
                      return (
                        <div key={env} className="nf-card">
                          <div className="nf-badge" style={{ marginBottom: 8 }}>{ENV_LABEL[env]}</div>
                          {!d ? (
                            <div style={{ color: "var(--nf-text-faint)", fontSize: 12.5 }}>No deployment yet</div>
                          ) : (
                            <>
                              <span className={`nf-badge ${STATE_CLASS[d.state] || ""}`}>{d.state}</span>
                              <div style={{ fontSize: 12, color: "var(--nf-text-dim)", marginTop: 6 }}>
                                {d.ref} · {timeAgo(d.createdAt)}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
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

export default Deployments;
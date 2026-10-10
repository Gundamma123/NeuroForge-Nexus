import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getProjectById } from "../../services/projectService";
import { getRepoSettings, setRepoSync } from "../../services/githubService";

const errorText = (err, fallback) => err?.response?.data?.message || fallback;

const ProjectSettings = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [syncSaving, setSyncSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.allSettled([getProjectById(projectId), getRepoSettings(projectId)]).then(([p, s]) => {
      if (cancelled) return;
      if (p.status === "fulfilled") setProject(p.value);
      if (s.status === "fulfilled") setData(s.value);
      // settings failure is non-fatal — project info still shows
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [projectId]);

  const toggleSync = async () => {
    if (!data) return;
    setSyncSaving(true);
    setError("");
    setNotice("");
    try {
      const res = await setRepoSync(projectId, !data.sync.active);
      setData((d) => ({ ...d, sync: { ...d.sync, active: res.syncActive } }));
      setNotice(res.syncActive ? "Sync resumed." : "Sync paused.");
    } catch (err) {
      setError(errorText(err, "Could not update sync."));
    } finally {
      setSyncSaving(false);
    }
  };

  const general = data?.general;
  const collaborators = data?.collaborators;
  const webhooks = data?.webhooks;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/projects/${projectId}`)}>
            ← Back to Project
          </span>
          <h1 className="nf-page-title">{project ? `${project.name} — Settings` : "Settings"}</h1>

          {notice && <div className="nf-gh-notice">{notice}</div>}
          {error && <div className="nf-form-error">{error}</div>}
          {loading && <div className="nf-loading" style={{ minHeight: 120 }}>Loading settings...</div>}

          {!loading && (
            <>
              {project && (
                <div className="nf-panel" style={{ marginBottom: 16 }}>
                  <h3>General</h3>
                  <div className="nf-detail-row"><b>Project:</b> {project.name}</div>
                  <div className="nf-detail-row"><b>Status:</b> {project.status}</div>
                  <div className="nf-detail-row"><b>Team size:</b> {project.teamSize ?? "—"}</div>
                  <div className="nf-detail-row"><b>Description:</b> {project.description || "—"}</div>

                  {general && (
                    <>
                      <hr style={{ border: "none", borderTop: "1px solid var(--nf-card-border)", margin: "14px 0" }} />
                      <div className="nf-detail-row">
                        <b>Repository:</b>{" "}
                        {general.htmlUrl?.startsWith("https://")
                          ? <a href={general.htmlUrl} target="_blank" rel="noreferrer">{general.fullName}</a>
                          : general.fullName}
                      </div>
                      <div className="nf-detail-row"><b>Visibility:</b> {general.isPrivate ? "Private" : "Public"}</div>
                      <div className="nf-detail-row"><b>Default branch:</b> {general.defaultBranch}</div>
                      <div className="nf-detail-row"><b>Open issues + PRs:</b> {general.openIssues}</div>
                      {general.archived && <div className="nf-detail-row"><b>Archived:</b> yes (read-only on GitHub)</div>}
                      {general.description && <div className="nf-detail-row"><b>About:</b> {general.description}</div>}
                      {general.topics?.length > 0 && (
                        <div className="nf-detail-row">
                          <b>Topics:</b>{" "}
                          {general.topics.map((t) => <span className="nf-badge" key={t} style={{ marginRight: 4 }}>{t}</span>)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {!data && (
                <div className="nf-panel" style={{ marginBottom: 16 }}>
                  <div className="nf-empty-state" style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>
                    GitHub repository settings are unavailable. The GitHub App may not have sufficient permissions for this repository.
                  </div>
                </div>
              )}

              {data && (
                <>
                  <div className="nf-panel" style={{ marginBottom: 16 }}>
                    <h3>Issue sync</h3>
                    <p className="nf-detail-row">
                      When active, tasks in this project create and update matching GitHub issues.
                      Linked by {data.sync.linkedBy || "unknown"}.
                    </p>
                    <div className="nf-detail-row">
                      <span className={`nf-status-dot ${data.sync.active ? "" : "inactive"}`}>
                        {data.sync.active ? "Sync active" : "Sync paused"}
                      </span>
                    </div>
                    <div className="nf-actions">
                      <button className="nf-btn secondary" onClick={toggleSync} disabled={syncSaving}>
                        {syncSaving ? "Saving..." : data.sync.active ? "Pause sync" : "Resume sync"}
                      </button>
                    </div>
                  </div>

                  <div className="nf-panel" style={{ marginBottom: 16 }}>
                    <h3>Collaborators</h3>
                    {!collaborators ? (
                      <div className="nf-empty-state">
                        Your GitHub account can't list collaborators. GitHub requires push access to this repository.
                      </div>
                    ) : collaborators.length === 0 ? (
                      <div className="nf-empty-state">No collaborators found.</div>
                    ) : (
                      <div className="nf-table-wrap">
                        <table className="nf-table">
                          <thead><tr><th>User</th><th>Permission</th></tr></thead>
                          <tbody>
                            {collaborators.map((c) => (
                              <tr key={c.login}>
                                <td>
                                  {c.url?.startsWith("https://")
                                    ? <a href={c.url} target="_blank" rel="noreferrer">@{c.login}</a>
                                    : `@${c.login}`}
                                </td>
                                <td><span className="nf-badge">{c.role}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="nf-panel">
                    <h3>Webhooks</h3>
                    {!webhooks ? (
                      <div className="nf-empty-state">
                        Your GitHub account can't list webhooks. GitHub requires admin access to this repository.
                      </div>
                    ) : webhooks.length === 0 ? (
                      <div className="nf-empty-state">No webhooks configured.</div>
                    ) : (
                      <div className="nf-table-wrap">
                        <table className="nf-table">
                          <thead><tr><th>Payload URL</th><th>Events</th><th>Status</th></tr></thead>
                          <tbody>
                            {webhooks.map((w) => (
                              <tr key={w.id}>
                                <td style={{ wordBreak: "break-all" }}>{w.url || "—"}</td>
                                <td>{(w.events || []).join(", ") || "—"}</td>
                                <td>
                                  <span className={`nf-status-dot ${w.active ? "" : "inactive"}`}>
                                    {w.active ? "Active" : "Inactive"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <p className="nf-detail-row" style={{ color: "var(--nf-text-faint)", fontSize: 12, marginTop: 12 }}>
                      Collaborators and webhooks are managed on GitHub. NeuroForge shows them read-only.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectSettings;

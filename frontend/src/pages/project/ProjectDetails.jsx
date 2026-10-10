import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import FormShell from "../../components/FormShell";
import GithubRepoPanel from "../../components/GithubRepoPanel";
import { getProjectById, updateProject } from "../../services/projectService";
import { getSprintsByProject } from "../../services/sprintService";

const PROJECT_STATUSES = ["Active", "On Hold", "Completed"];

const PROJECT_STATUS_CLASS = {
  Active: "status-inprogress",
  "On Hold": "status-todo",
  Completed: "status-done",
};

const SPRINT_STATUS_CLASS = {
  Planned: "status-todo",
  Active: "status-inprogress",
  Completed: "status-done",
  Cancelled: "status-cancelled",
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sprintError, setSprintError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", status: "Active", teamSize: "", description: "" });
  const [showGithub, setShowGithub] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSprintError("");

    Promise.allSettled([getProjectById(id), getSprintsByProject(id)]).then(([p, s]) => {
      if (cancelled) return;

      if (p.status === "fulfilled" && p.value) {
        setProject(p.value);
        setForm({
          name: p.value.name || "",
          status: p.value.status || "Active",
          teamSize: p.value.teamSize ?? "",
          description: p.value.description || "",
        });
      } else {
        setProject(null);
        setError("Project not found.");
      }

      if (s.status === "fulfilled") {
        setSprints(Array.isArray(s.value) ? s.value : []);
      } else {
        setSprints([]);
        setSprintError("Could not load this project's sprints.");
      }

      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await updateProject(id, {
        name: form.name.trim(),
        status: form.status,
        teamSize: form.teamSize === "" ? 0 : Number(form.teamSize),
        description: form.description,
      });
      setProject(updated || { ...project, ...form });
      setEditMode(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="nf-app">
        <Navbar />
        <div className="nf-body">
          <Sidebar />
          <main className="nf-main"><div className="nf-loading">Loading project...</div></main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="nf-app">
        <Navbar />
        <div className="nf-body">
          <Sidebar />
          <main className="nf-main">
            <span className="nf-back-link" onClick={() => navigate("/projects")}>← Back to Projects</span>
            <div className="nf-form-error">{error || "Project not found."}</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate("/projects")}>← Back to Projects</span>
          <h1 className="nf-page-title">{project.name}</h1>

          {error && <div className="nf-form-error">{error}</div>}

          {editMode ? (
            <form onSubmit={handleSave}>
              <FormShell
                main={
                  <>
                    <div className="nf-field">
                      <label>Project Name</label>
                      <input name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="nf-field">
                      <label>Description</label>
                      <textarea name="description" value={form.description} onChange={handleChange} />
                    </div>
                  </>
                }
                sidebar={
                  <>
                    <div className="nf-field">
                      <label>Status</label>
                      <select name="status" value={form.status} onChange={handleChange}>
                        {PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="nf-field">
                      <label>Team Size</label>
                      <input name="teamSize" type="number" min="0" value={form.teamSize} onChange={handleChange} />
                    </div>
                  </>
                }
                actions={
                  <>
                    <button type="submit" className="nf-btn" disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" className="nf-btn secondary" onClick={() => setEditMode(false)}>
                      Cancel
                    </button>
                  </>
                }
              />
            </form>
          ) : (
            <div className="nf-panel">
              <p className="nf-detail-row" style={{ marginTop: 0 }}>
                {project.description || "No description provided."}
              </p>

              <div className="nf-detail-grid">
                <div className="nf-card">
                  <div className="nf-stat-label">Status</div>
                  <span className={`nf-badge ${PROJECT_STATUS_CLASS[project.status] || ""}`}>{project.status}</span>
                </div>
                <div className="nf-card">
                  <div className="nf-stat-label">Team Size</div>
                  <div className="nf-detail-row" style={{ margin: 0 }}>{project.teamSize ?? "—"} members</div>
                </div>
                <div className="nf-card">
                  <div className="nf-stat-label">Sprints</div>
                  <div className="nf-detail-row" style={{ margin: 0 }}>{sprints.length}</div>
                </div>
              </div>

              <div className="nf-actions">
                <button className="nf-btn" onClick={() => setEditMode(true)}>Edit Project</button>
                <button className="nf-btn secondary" onClick={() => navigate(`/projects/${id}/sprints`)}>
                  View Sprints
                </button>
                <button className="nf-btn secondary" onClick={() => navigate(`/projects/${id}/teams`)}>
                  View Teams
                </button>
              </div>
            </div>
          )}

          {/* Sprints: the way into the Kanban board, tasks and subtasks */}
          <div className="nf-panel" style={{ marginTop: 16 }}>
            <div className="nf-toolbar">
              <h3 style={{ margin: 0 }}>Sprints</h3>
              <div style={{ flex: 1 }} />
              <button className="nf-btn" onClick={() => navigate(`/projects/${id}/sprints`)}>
                + Plan Sprint
              </button>
            </div>

            {sprintError && <div className="nf-form-error">{sprintError}</div>}

            {sprints.length === 0 && !sprintError ? (
              <div className="nf-empty-state">
                No sprints yet. Click "Plan Sprint" to create the first one, then open it to add tasks.
              </div>
            ) : (
              <div className="nf-table-wrap">
                <table className="nf-table">
                  <thead>
                    <tr>
                      <th>Sprint</th>
                      <th>Status</th>
                      <th>Dates</th>
                      <th>Tasks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sprints.map((s) => (
                      <tr key={s.id} className="clickable" onClick={() => navigate(`/sprints/${s.id}`)}>
                        <td><b>{s.name}</b></td>
                        <td>
                          <span className={`nf-badge ${SPRINT_STATUS_CLASS[s.status] || ""}`}>{s.status}</span>
                        </td>
                        <td>{s.startDate || "—"} → {s.endDate || "—"}</td>
                        <td>{s.taskCount ?? 0}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="nf-table-actions">
                            <button className="nf-link-btn" onClick={() => navigate(`/sprints/${s.id}`)}>
                              Open board
                            </button>
                            <button className="nf-link-btn" onClick={() => navigate(`/sprints/${s.id}/tasks`)}>
                              Tasks
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="nf-panel" style={{ marginTop: 16 }}>
            <div className="nf-toolbar">
              <h3 style={{ margin: 0 }}>GitHub</h3>
              <div style={{ flex: 1 }} />
              <button className="nf-btn secondary" onClick={() => setShowGithub((v) => !v)}>
                {showGithub ? "Hide" : "Show GitHub"}
              </button>
            </div>
          </div>
          {showGithub && <GithubRepoPanel projectId={id} projectName={project.name} />}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetails;
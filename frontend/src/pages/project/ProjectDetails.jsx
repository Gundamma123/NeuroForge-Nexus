import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getProjectById, updateProject } from "../../services/projectService";

const STATUSES = ["Active", "On Hold", "Completed"];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", status: "Active", teamSize: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getProjectById(id)
      .then((data) => {
        if (cancelled) return;
        setProject(data);
        setForm({
          name: data.name,
          status: data.status,
          teamSize: data.teamSize ?? "",
          description: data.description || "",
        });
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load this project.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, teamSize: form.teamSize ? Number(form.teamSize) : 0 };
      const updated = await updateProject(id, payload);
      setProject(updated);
      setEditMode(false);
    } catch {
      setError("Failed to save changes.");
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
          <main className="nf-main">
            <div className="nf-loading">Loading project...</div>
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
          <span className="nf-back-link" onClick={() => navigate("/projects")}>
            ← Back to Projects
          </span>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            {!editMode ? (
              <>
                <h1 className="nf-page-title" style={{ marginBottom: 4 }}>{project.name}</h1>
                <div className="nf-detail-grid" style={{ marginTop: 16 }}>
                  <div className="nf-card">
                    <div className="nf-stat-label">Status</div>
                    <span className="nf-badge">{project.status}</span>
                  </div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Team Size</div>
                    <div className="nf-detail-row" style={{ margin: 0 }}>{project.teamSize ?? "—"}</div>
                  </div>
                </div>
                <div className="nf-detail-row">
                  <b>Description:</b> {project.description || "No description provided."}
                </div>

                <div className="nf-actions">
                  <button className="nf-btn" onClick={() => setEditMode(true)}>Edit Project</button>
                  <button className="nf-btn secondary" onClick={() => navigate("/sprints/create")}>
                    Plan a Sprint
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} style={{ maxWidth: 460 }}>
                <div className="nf-field">
                  <label>Project Name</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="nf-field">
                  <label>Team Size</label>
                  <input name="teamSize" type="number" min="0" value={form.teamSize} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Description</label>
                  <input name="description" value={form.description} onChange={handleChange} />
                </div>
                <div className="nf-actions">
                  <button type="submit" className="nf-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button type="button" className="nf-btn secondary" onClick={() => setEditMode(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ProjectDetails;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getSprintById, updateSprint, deleteSprint } from "../../services/sprintService";

const STATUSES = ["Active", "Planned", "Completed"];

const SprintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", taskCount: "", points: "", startDate: "", endDate: "", status: "Planned" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getSprintById(id)
      .then((data) => {
        if (cancelled) return;
        setSprint(data);
        setForm({
          name: data.name,
          taskCount: data.taskCount ?? "",
          points: data.points ?? "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          status: data.status,
        });
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load this sprint.");
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
      const payload = {
        ...form,
        taskCount: form.taskCount ? Number(form.taskCount) : 0,
        points: form.points ? Number(form.points) : 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      const updated = await updateSprint(id, payload);
      setSprint(updated);
      setEditMode(false);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSprint(id);
      navigate("/sprints");
    } catch {
      setError("Failed to delete sprint.");
    }
  };

  if (loading) {
    return (
      <div className="nf-app">
        <Navbar />
        <div className="nf-body">
          <Sidebar />
          <main className="nf-main">
            <div className="nf-loading">Loading sprint...</div>
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
          <span className="nf-back-link" onClick={() => navigate("/sprints")}>
            ← Back to Sprint Planning
          </span>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            {!editMode ? (
              <>
                <h1 className="nf-page-title" style={{ marginBottom: 4 }}>{sprint.name}</h1>
                <div className="nf-detail-grid" style={{ marginTop: 16 }}>
                  <div className="nf-card">
                    <div className="nf-stat-label">Tasks</div>
                    <div className="nf-stat-value" style={{ fontSize: 22 }}>{sprint.taskCount ?? 0}</div>
                  </div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Points</div>
                    <div className="nf-stat-value" style={{ fontSize: 22 }}>{sprint.points ?? 0}</div>
                  </div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Status</div>
                    <span className="nf-badge">{sprint.status}</span>
                  </div>
                </div>
                <div className="nf-detail-row"><b>Start:</b> {sprint.startDate || "—"}</div>
                <div className="nf-detail-row"><b>End:</b> {sprint.endDate || "—"}</div>
                <div className="nf-detail-row"><b>Project:</b> {sprint.project?.name || "Unassigned"}</div>

                <div className="nf-actions">
                  <button className="nf-btn" onClick={() => setEditMode(true)}>Edit Sprint</button>
                  <button className="nf-btn secondary" onClick={handleDelete}>Delete Sprint</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} style={{ maxWidth: 460 }}>
                <div className="nf-field">
                  <label>Sprint Name</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Task Count</label>
                  <input name="taskCount" type="number" min="0" value={form.taskCount} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Points</label>
                  <input name="points" type="number" min="0" value={form.points} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Start Date</label>
                  <input name="startDate" type="date" value={form.startDate} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>End Date</label>
                  <input name="endDate" type="date" value={form.endDate} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
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

export default SprintDetails;
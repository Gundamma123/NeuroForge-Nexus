import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getMilestoneById, updateMilestone, deleteMilestone } from "../../services/milestoneService";

const STATUSES = ["Pending", "In Progress", "Completed"];

const MilestoneDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [milestone, setMilestone] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", dueDate: "", status: "Pending" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMilestoneById(id)
      .then((data) => {
        if (cancelled) return;
        setMilestone(data);
        setForm({ name: data.name, dueDate: data.dueDate || "", status: data.status });
      })
      .catch(() => {
        if (!cancelled) setError("Unable to load this milestone.");
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
      const payload = { ...form, dueDate: form.dueDate || null };
      const updated = await updateMilestone(id, payload);
      setMilestone(updated);
      setEditMode(false);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMilestone(id);
      navigate("/milestones");
    } catch {
      setError("Failed to delete milestone.");
    }
  };

  if (loading) {
    return (
      <div className="nf-app">
        <Navbar />
        <div className="nf-body">
          <Sidebar />
          <main className="nf-main">
            <div className="nf-loading">Loading milestone...</div>
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
          <span className="nf-back-link" onClick={() => navigate("/milestones")}>
            ← Back to Milestone Tracking
          </span>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            {!editMode ? (
              <>
                <h1 className="nf-page-title" style={{ marginBottom: 4 }}>{milestone.name}</h1>
                <div className="nf-detail-grid" style={{ marginTop: 16 }}>
                  <div className="nf-card">
                    <div className="nf-stat-label">Status</div>
                    <span className="nf-badge">{milestone.status}</span>
                  </div>
                  <div className="nf-card">
                    <div className="nf-stat-label">Due Date</div>
                    <div className="nf-detail-row" style={{ margin: 0 }}>{milestone.dueDate || "—"}</div>
                  </div>
                </div>
                <div className="nf-detail-row"><b>Project:</b> {milestone.project?.name || "Unassigned"}</div>

                <div className="nf-actions">
                  <button className="nf-btn" onClick={() => setEditMode(true)}>Edit Milestone</button>
                  <button className="nf-btn secondary" onClick={handleDelete}>Delete Milestone</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave} style={{ maxWidth: 460 }}>
                <div className="nf-field">
                  <label>Milestone Name</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Due Date</label>
                  <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
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

export default MilestoneDetails;
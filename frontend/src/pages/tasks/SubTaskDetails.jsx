import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getSubTaskById, updateSubTask, deleteSubTask } from "../../services/subTaskService";

const STATUSES = ["Pending", "In Progress", "Completed"];

const SubTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subTask, setSubTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ title: "", status: "Pending", dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getSubTaskById(id)
      .then((data) => {
        setSubTask(data);
        setForm({ title: data.title, status: data.status, dueDate: data.dueDate || "" });
      })
      .catch(() => setError("Unable to load this subtask."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateSubTask(id, {
        ...form, taskId: subTask.task?.id, assigneeId: subTask.assignee?.id || null,
      });
      setSubTask(updated);
      setEditMode(false);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSubTask(id);
      navigate(`/tasks/${subTask.task.id}/subtasks`);
    } catch {
      setError("Failed to delete subtask.");
    }
  };

  if (loading) {
    return (
      <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
        <main className="nf-main"><div className="nf-loading">Loading subtask...</div></main>
      </div><Footer /></div>
    );
  }

  if (!subTask) {
    return (
      <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
        <main className="nf-main"><div className="nf-form-error">{error || "Subtask not found."}</div></main>
      </div><Footer /></div>
    );
  }

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/tasks/${subTask.task.id}/subtasks`)}>
            ← Back to Subtasks
          </span>

          <div className="nf-panel" style={{ maxWidth: 460 }}>
            {error && <div className="nf-form-error">{error}</div>}

            {!editMode ? (
              <>
                <h1 className="nf-page-title" style={{ marginBottom: 4 }}>{subTask.title}</h1>
                <div className="nf-detail-row"><b>Parent Task:</b> {subTask.task?.title || "—"}</div>
                <div className="nf-detail-row"><b>Assignee:</b> {subTask.assignee?.name || "Unassigned"}</div>
                <div className="nf-detail-row"><b>Status:</b> <span className="nf-badge">{subTask.status}</span></div>
                <div className="nf-detail-row"><b>Due Date:</b> {subTask.dueDate || "—"}</div>

                <div className="nf-actions">
                  <button className="nf-btn" onClick={() => setEditMode(true)}>Edit</button>
                  <button className="nf-btn secondary" onClick={handleDelete}>Delete</button>
                </div>
              </>
            ) : (
              <form onSubmit={handleSave}>
                <div className="nf-field"><label>Title</label><input name="title" value={form.title} onChange={handleChange} /></div>
                <div className="nf-field">
                  <label>Status</label>
                  <select name="status" value={form.status} onChange={handleChange}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="nf-field"><label>Due Date</label><input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} /></div>
                <div className="nf-actions">
                  <button type="submit" className="nf-btn" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                  <button type="button" className="nf-btn secondary" onClick={() => setEditMode(false)}>Cancel</button>
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

export default SubTaskDetails;
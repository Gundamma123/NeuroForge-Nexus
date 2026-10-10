import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getTaskById, updateTask } from "../../services/taskService";
import { getTeamsByProject } from "../../services/teamService";
import FormShell from "../../components/FormShell";

const PRIORITIES = ["Low", "Medium", "High", "Critical"];
const STATUSES = ["To Do", "In Progress", "In Review", "Done"];

const EditTask = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", assigneeId: "", priority: "Medium", status: "To Do",
    storyPoints: "", startDate: "", dueDate: "",
  });

  useEffect(() => {
    getTaskById(id)
      .then((data) => {
        setTask(data);
        setForm({
          title: data.title,
          description: data.description || "",
          assigneeId: data.assignee?.id ? String(data.assignee.id) : "",
          priority: data.priority,
          status: data.status,
          storyPoints: data.storyPoints ?? "",
          startDate: data.startDate || "",
          dueDate: data.dueDate || "",
        });
        if (data.sprint?.project?.id) {
          getTeamsByProject(data.sprint.project.id).then((teams) => {
            const all = (Array.isArray(teams) ? teams : []).flatMap((t) => t.members || []);
            setMembers(Array.from(new Map(all.map((m) => [m.id, m])).values()));
          });
        }
      })
      .catch(() => setError("Unable to load this task."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateTask(id, {
        ...form,
        sprintId: task.sprint?.id,
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        storyPoints: form.storyPoints ? Number(form.storyPoints) : 0,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
      });
      navigate(`/tasks/${id}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update task.");
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
            <div className="nf-loading">Loading task...</div>
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
          <span className="nf-back-link" onClick={() => navigate(`/tasks/${id}`)}>
            ← Back to Task
          </span>
          <h1 className="nf-page-title">Edit Task</h1>

          <div className="nf-panel nf-modal-wide" style={{ maxWidth: 900 }}>
            {error && <div className="nf-form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
  <FormShell
    error={error}
    main={
      <>
        <div className="nf-field"><label>Task Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
        <div className="nf-field"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} /></div>
      </>
    }
    sidebar={
      <>
        <div className="nf-field">
          <label>Assigned To</label>
          <select name="assigneeId" value={form.assigneeId} onChange={handleChange}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
          </select>
        </div>
        <div className="nf-field">
          <label>Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="nf-field">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="nf-field"><label>Story Points</label><input name="storyPoints" type="number" min="0" value={form.storyPoints} onChange={handleChange} /></div>
        <div className="nf-field"><label>Start Date</label><input name="startDate" type="date" value={form.startDate} onChange={handleChange} /></div>
        <div className="nf-field"><label>Due Date</label><input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} /></div>
      </>
    }
    actions={
      <>
        <button type="submit" className="nf-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
        <button type="button" className="nf-btn secondary" onClick={() => navigate(`/tasks/${id}`)}>Cancel</button>
      </>
    }
  />
</form>

            
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditTask;
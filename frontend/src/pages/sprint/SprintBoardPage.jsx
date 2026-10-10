import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Modal from "../../components/Modal";
import SprintBoard from "../../components/SprintBoard";
import { getSprintById } from "../../services/sprintService";
import { getTasksBySprint, createTask, updateTask, deleteTask } from "../../services/taskService";
import { getSubTasksByTask, createSubTask, updateSubTask, deleteSubTask } from "../../services/subTaskService";
import { getTeamsByProject } from "../../services/teamService";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const STATUSES = ["To Do", "In Progress", "In Review", "Done"];
const SUBTASK_STATUSES = ["Pending", "Completed"];

const SprintBoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", assigneeId: "", priority: "Medium", status: "To Do", storyPoints: "", dueDate: "",
  });
  const [saving, setSaving] = useState(false);

  const [subTasks, setSubTasks] = useState([]);
  const [subTaskTitle, setSubTaskTitle] = useState("");

  const loadData = () => {
    setLoading(true);
    getSprintById(id)
      .then((sprintData) => {
        setSprint(sprintData);
        return Promise.all([
          getTasksBySprint(id),
          sprintData.project?.id ? getTeamsByProject(sprintData.project.id) : Promise.resolve([]),
        ]);
      })
      .then(([taskData, teamsData]) => {
        setTasks(Array.isArray(taskData) ? taskData : []);
        const members = (Array.isArray(teamsData) ? teamsData : []).flatMap((t) => t.members || []);
        // de-duplicate members across multiple teams on the same project
        const unique = Array.from(new Map(members.map((m) => [m.id, m])).values());
        setProjectMembers(unique);
      })
      .catch(() => setError("Could not load this sprint's board."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Done").length,
    pending: tasks.filter((t) => t.status !== "Done").length,
    points: tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0),
  };
  const progressPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({ title: "", description: "", assigneeId: "", priority: "Medium", status: "To Do", storyPoints: "", dueDate: "" });
    setSubTasks([]);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      assigneeId: task.assignee?.id ? String(task.assignee.id) : "",
      priority: task.priority,
      status: task.status,
      storyPoints: task.storyPoints ?? "",
      dueDate: task.dueDate || "",
    });
    getSubTasksByTask(task.id)
      .then((data) => setSubTasks(Array.isArray(data) ? data : []))
      .catch(() => setSubTasks([]));
    setModalOpen(true);
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        sprintId: Number(id),
        assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
        storyPoints: form.storyPoints ? Number(form.storyPoints) : 0,
        dueDate: form.dueDate || null,
      };
      if (editingTask) {
        await updateTask(editingTask.id, payload);
      } else {
        await createTask(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    try {
      await deleteTask(editingTask.id);
      setModalOpen(false);
      loadData();
    } catch {
      setError("Failed to delete task.");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));

    try {
      await updateTask(taskId, {
        title: task.title,
        description: task.description,
        sprintId: Number(id),
        assigneeId: task.assignee?.id || null,
        priority: task.priority,
        status: newStatus,
        storyPoints: task.storyPoints,
        dueDate: task.dueDate,
      });
    } catch {
      setError("Failed to update task status.");
      loadData();
    }
  };

  const handleAddSubTask = async () => {
    if (!subTaskTitle.trim() || !editingTask) return;
    try {
      const created = await createSubTask({
        title: subTaskTitle,
        taskId: editingTask.id,
        status: "Pending",
      });
      setSubTasks((prev) => [...prev, created]);
      setSubTaskTitle("");
    } catch {
      setError("Failed to add sub-task.");
    }
  };

  const toggleSubTaskStatus = async (subTask) => {
    const newStatus = subTask.status === "Completed" ? "Pending" : "Completed";
    setSubTasks((prev) => prev.map((s) => (s.id === subTask.id ? { ...s, status: newStatus } : s)));
    try {
      await updateSubTask(subTask.id, { title: subTask.title, taskId: editingTask.id, status: newStatus });
    } catch {
      setError("Failed to update sub-task.");
    }
  };

  const removeSubTask = async (subTaskId) => {
    setSubTasks((prev) => prev.filter((s) => s.id !== subTaskId));
    try {
      await deleteSubTask(subTaskId);
    } catch {
      setError("Failed to delete sub-task.");
    }
  };

  if (loading) {
    return (
      <div className="nf-app">
        <Navbar />
        <div className="nf-body">
          <Sidebar />
          <main className="nf-main">
            <div className="nf-loading">Loading sprint board...</div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  const completedSubTasks = subTasks.filter((s) => s.status === "Completed").length;
  const subTaskProgress = subTasks.length > 0 ? Math.round((completedSubTasks / subTasks.length) * 100) : 0;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/sprints/${id}`)}>
            ← Back to Sprint Details
          </span>

          <h1 className="nf-page-title">{sprint?.name} — Sprint Board</h1>
          {sprint?.goal && <p className="nf-detail-row" style={{ marginTop: -14 }}>{sprint.goal}</p>}

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-stat-grid" style={{ marginBottom: 18 }}>
            <div className="nf-card"><div className="nf-stat-label">Total Tasks</div><div className="nf-stat-value">{stats.total}</div></div>
            <div className="nf-card"><div className="nf-stat-label">Completed</div><div className="nf-stat-value">{stats.completed}</div></div>
            <div className="nf-card"><div className="nf-stat-label">Pending</div><div className="nf-stat-value">{stats.pending}</div></div>
            <div className="nf-card"><div className="nf-stat-label">Story Points</div><div className="nf-stat-value">{stats.points}</div></div>
            <div className="nf-card"><div className="nf-stat-label">Progress</div><div className="nf-stat-value">{progressPct}%</div></div>
          </div>

          <div className="nf-toolbar">
            <div style={{ flex: 1 }} />
            <button className="nf-btn" onClick={openCreateModal}>+ Add Task</button>
          </div>

          <SprintBoard tasks={tasks} onTaskClick={openEditModal} onStatusChange={handleStatusChange} />
        </main>
      </div>
      <Footer />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? "Edit Task" : "Add Task"}>
        <form onSubmit={handleSaveTask}>
          <div className="nf-field">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleFormChange} required />
          </div>
          <div className="nf-field">
            <label>Description</label>
            <input name="description" value={form.description} onChange={handleFormChange} />
          </div>
          <div className="nf-field">
            <label>Assigned To</label>
            <select name="assigneeId" value={form.assigneeId} onChange={handleFormChange}>
              <option value="">Unassigned</option>
              {projectMembers.map((m) => (
                <option key={m.id} value={m.id}>{m.name} — {m.role}</option>
              ))}
            </select>
            {projectMembers.length === 0 && (
              <div className="nf-field-error">No team members found for this project yet.</div>
            )}
          </div>
          <div className="nf-field">
            <label>Priority</label>
            <select name="priority" value={form.priority} onChange={handleFormChange}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="nf-field">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleFormChange}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="nf-field">
            <label>Story Points</label>
            <input name="storyPoints" type="number" min="0" value={form.storyPoints} onChange={handleFormChange} />
          </div>
          <div className="nf-field">
            <label>Due Date</label>
            <input name="dueDate" type="date" value={form.dueDate} onChange={handleFormChange} />
          </div>

          <div className="nf-actions">
            <button type="submit" className="nf-btn" disabled={saving}>
              {saving ? "Saving..." : editingTask ? "Save Changes" : "Add Task"}
            </button>
            {editingTask && (
              <button type="button" className="nf-btn secondary" onClick={handleDeleteTask}>
                Delete Task
              </button>
            )}
          </div>
        </form>

        {editingTask && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--nf-card-border)" }}>
            <h3 style={{ marginBottom: 4 }}>Subtasks</h3>
            {subTasks.length > 0 && (
              <p className="nf-detail-row" style={{ marginTop: 0, fontSize: 12.5 }}>
                {completedSubTasks} / {subTasks.length} Completed — Progress: {subTaskProgress}%
              </p>
            )}

            {subTasks.map((s) => (
              <div key={s.id} className="nf-detail-row" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={s.status === "Completed"}
                  onChange={() => toggleSubTaskStatus(s)}
                />
                <span style={{ flex: 1, textDecoration: s.status === "Completed" ? "line-through" : "none" }}>
                  {s.title}
                </span>
                <button className="nf-link-btn danger" onClick={() => removeSubTask(s.id)}>Remove</button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                className="nf-search-input"
                placeholder="New subtask title..."
                value={subTaskTitle}
                onChange={(e) => setSubTaskTitle(e.target.value)}
              />
              <button type="button" className="nf-btn secondary" onClick={handleAddSubTask}>
                Add
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SprintBoardPage;
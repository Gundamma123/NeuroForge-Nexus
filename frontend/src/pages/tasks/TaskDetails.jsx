import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getTaskById, deleteTask } from "../../services/taskService";
import { getSubTasksByTask } from "../../services/subTaskService";

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getTaskById(id), getSubTasksByTask(id)])
      .then(([taskData, subTaskData]) => {
        setTask(taskData);
        setSubTasks(Array.isArray(subTaskData) ? subTaskData : []);
      })
      .catch(() => setError("Unable to load this task."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteTask(id);
      navigate(`/sprints/${task.sprint.id}/tasks`);
    } catch {
      setError("Failed to delete task.");
    }
  };

  if (loading) {
    return (
      <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
        <main className="nf-main"><div className="nf-loading">Loading task...</div></main>
      </div><Footer /></div>
    );
  }

  if (!task) {
    return (
      <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
        <main className="nf-main"><div className="nf-form-error">{error || "Task not found."}</div></main>
      </div><Footer /></div>
    );
  }

  const completed = subTasks.filter((s) => s.status === "Completed").length;
  const progress = subTasks.length > 0 ? Math.round((completed / subTasks.length) * 100) : 0;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/sprints/${task.sprint.id}/tasks`)}>
            ← Back to Tasks
          </span>

          <div className="nf-panel">
            <h1 className="nf-page-title" style={{ marginBottom: 4 }}>{task.title}</h1>
            <p className="nf-detail-row" style={{ marginTop: -8 }}>{task.description || "No description."}</p>

            <div className="nf-detail-row"><b>Project:</b> {task.sprint?.project?.name || "—"}</div>
            <div className="nf-detail-row"><b>Sprint:</b> {task.sprint?.name || "—"}</div>

            <div className="nf-detail-grid">
              <div className="nf-card"><div className="nf-stat-label">Assignee</div><div className="nf-detail-row" style={{ margin: 0 }}>{task.assignee?.name || "Unassigned"}</div></div>
              <div className="nf-card"><div className="nf-stat-label">Priority</div><span className="nf-badge">{task.priority}</span></div>
              <div className="nf-card"><div className="nf-stat-label">Status</div><span className="nf-badge">{task.status}</span></div>
              <div className="nf-card"><div className="nf-stat-label">Start Date</div><div className="nf-detail-row" style={{ margin: 0 }}>{task.startDate || "—"}</div></div>
              <div className="nf-card"><div className="nf-stat-label">Due Date</div><div className="nf-detail-row" style={{ margin: 0 }}>{task.dueDate || "—"}</div></div>
            </div>

            <div className="nf-actions">
              <button className="nf-btn" onClick={() => navigate(`/tasks/${id}/edit`)}>Edit Task</button>
              <button className="nf-btn secondary" onClick={handleDelete}>Delete Task</button>
            </div>
          </div>

          <div className="nf-panel" style={{ marginTop: 16 }}>
            <h3>Subtasks {subTasks.length > 0 && <>— {completed} / {subTasks.length} Completed — {progress}%</>}</h3>

            {subTasks.length === 0 ? (
              <div className="nf-empty-state">No subtasks yet.</div>
            ) : (
              subTasks.map((s) => (
                <div key={s.id} className="nf-detail-row">
                  {s.status === "Completed" ? "☑" : "☐"} {s.title}
                  {s.assignee && <span style={{ color: "var(--nf-text-faint)", fontSize: 12 }}> — {s.assignee.name}</span>}
                </div>
              ))
            )}

            <div className="nf-actions">
              <button className="nf-btn" onClick={() => navigate(`/tasks/${id}/subtasks/create`)}>+ Add Subtask</button>
              <button className="nf-btn secondary" onClick={() => navigate(`/tasks/${id}/subtasks`)}>Manage All Subtasks</button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TaskDetails;
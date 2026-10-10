import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getSprintById } from "../../services/sprintService";
import { getTasksBySprint, deleteTask } from "../../services/taskService";

const PRIORITY_CLASS = { Low: "role-dev", Medium: "role-pm", High: "role-admin", Critical: "role-admin" };

const dedupeById = (arr) => Array.from(new Map(arr.map((i) => [i.id, i])).values());

const TaskManagement = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();

  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    Promise.allSettled([getSprintById(sprintId), getTasksBySprint(sprintId)])
      .then(([s, t]) => {
        if (s.status === "fulfilled") setSprint(s.value);
        if (t.status === "fulfilled") setTasks(dedupeById(Array.isArray(t.value) ? t.value : []));
        else setError("Unable to load tasks for this sprint.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sprintId]);

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete task.");
    }
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/sprints/${sprintId}`)}>
            ← Back to Sprint
          </span>

          <h1 className="nf-page-title">{sprint ? `${sprint.name} — Tasks` : "Tasks"}</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <div style={{ flex: 1 }} />
              <button className="nf-btn" onClick={() => navigate(`/sprints/${sprintId}/tasks/create`)}>
                + Add Task
              </button>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr key={t.id}>
                      <td><b>{t.title}</b></td>
                      <td>{t.assignee?.name || "Unassigned"}</td>
                      <td><span className={`nf-badge ${PRIORITY_CLASS[t.priority] || ""}`}>{t.priority}</span></td>
                      <td><span className="nf-badge">{t.status}</span></td>
                      <td>{t.dueDate || "—"}</td>
                      <td>
                        <div className="nf-table-actions">
                          <button className="nf-link-btn" onClick={() => navigate(`/tasks/${t.id}`)}>View</button>
                          <button className="nf-link-btn" onClick={() => navigate(`/tasks/${t.id}/edit`)}>Edit</button>
                          <button className="nf-link-btn danger" onClick={() => handleDelete(t.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && tasks.length === 0 && (
                <div className="nf-empty-state">No tasks found in this sprint.</div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TaskManagement;
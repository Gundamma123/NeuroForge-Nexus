import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getSprintById } from "../../services/sprintService";
import { getTasksBySprint } from "../../services/taskService";

const STATUS_LABEL_CLASS = {
  "To Do": "status-todo",
  "In Progress": "status-inprogress",
  "In Review": "status-inreview",
  "Done": "status-done",
};
const PRIORITY_CLASS = { Low: "priority-low", Medium: "priority-medium", High: "priority-high", Critical: "priority-critical" };

const initials = (name = "") => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

const TimelineView = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getSprintById(sprintId), getTasksBySprint(sprintId)])
      .then(([sprintData, taskData]) => {
        setSprint(sprintData);
        setTasks((Array.isArray(taskData) ? taskData : []).filter((t) => t.startDate || t.dueDate));
      })
      .catch(() => setError("Unable to load timeline."))
      .finally(() => setLoading(false));
  }, [sprintId]);

  if (loading) {
    return (<div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
      <main className="nf-main"><div className="nf-loading">Loading timeline...</div></main>
    </div><Footer /></div>);
  }
  if (!sprint) {
    return (<div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
      <main className="nf-main"><div className="nf-form-error">{error || "Sprint not found."}</div></main>
    </div><Footer /></div>);
  }

  const rangeStart = new Date(sprint.startDate || tasks[0]?.startDate || Date.now());
  const rangeEnd = new Date(sprint.endDate || tasks[0]?.dueDate || Date.now());
  const totalDays = Math.max(1, Math.ceil((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)) + 1);

  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const barPosition = (task) => {
    const start = new Date(task.startDate || task.dueDate);
    const end = new Date(task.dueDate || task.startDate);
    const offsetDays = Math.max(0, Math.round((start - rangeStart) / (1000 * 60 * 60 * 24)));
    const durationDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);
    return { left: offsetDays * 64 + 4, width: durationDays * 64 - 8 };
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/sprints/${sprintId}`)}>← Back to Sprint Board</span>
          <h1 className="nf-page-title">{sprint.name} — Timeline</h1>
          <p className="nf-detail-row" style={{ marginTop: -8 }}>{sprint.startDate || "—"} to {sprint.endDate || "—"}</p>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-gantt">
            <div className="nf-gantt-left">
              <div className="nf-gantt-left-header">Issue</div>
              {tasks.map((t, idx) => (
                <div key={t.id} className="nf-gantt-row" onClick={() => navigate(`/tasks/${t.id}`)}>
                  <div className="nf-gantt-id">NF-{100 + idx + 1}</div>
                  <div className="nf-gantt-info">
                    <div className="nf-gantt-title">{t.title}</div>
                    <div className="nf-gantt-meta">
                      <span className={`nf-badge ${STATUS_LABEL_CLASS[t.status] || ""}`}>{t.status}</span>
                      <span className={`nf-badge ${PRIORITY_CLASS[t.priority] || ""}`}>{t.priority}</span>
                    </div>
                  </div>
                  {t.assignee && <div className="nf-gantt-avatar" title={t.assignee.name}>{initials(t.assignee.name)}</div>}
                </div>
              ))}
              {tasks.length === 0 && <div className="nf-empty-state">No dated tasks to display.</div>}
            </div>

            <div className="nf-gantt-right">
              <div className="nf-gantt-header-row">
                {days.map((d, i) => (
                  <div className="nf-gantt-day-header" key={i}>
                    {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                ))}
              </div>
              <div className="nf-gantt-body">
                {tasks.map((task) => {
                  const pos = barPosition(task);
                  return (
                    <div className="nf-gantt-grid-row" key={task.id}>
                      {days.map((_, i) => <div className="nf-gantt-grid-cell" key={i} />)}
                      <div
                        className="nf-gantt-bar"
                        style={{ left: pos.left, width: pos.width }}
                        title={`${task.startDate || "?"} → ${task.dueDate || "?"}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TimelineView;
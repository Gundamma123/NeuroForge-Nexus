import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getSprintById } from "../../services/sprintService";
import { getTasksBySprint } from "../../services/taskService";

const PRIORITY_CLASS = { Low: "role-dev", Medium: "role-pm", High: "role-admin", Critical: "role-admin" };

const ListView = () => {
  const { sprintId } = useParams();
  const navigate = useNavigate();
  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("title");

  useEffect(() => {
    Promise.all([getSprintById(sprintId), getTasksBySprint(sprintId)])
      .then(([sprintData, taskData]) => {
        setSprint(sprintData);
        setTasks(Array.isArray(taskData) ? taskData : []);
      })
      .catch(() => setError("Unable to load task list."))
      .finally(() => setLoading(false));
  }, [sprintId]);

  const taskKey = (id) => `PROJ-${String(id).padStart(3, "0")}`;

  const filtered = tasks
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === "priority") return (a.priority || "").localeCompare(b.priority || "");
      if (sortKey === "status") return (a.status || "").localeCompare(b.status || "");
      return (a.title || "").localeCompare(b.title || "");
    });

  if (loading) {
    return (
      <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
        <main className="nf-main"><div className="nf-loading">Loading list...</div></main>
      </div><Footer /></div>
    );
  }

  if (!sprint) {
    return (
      <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
        <main className="nf-main"><div className="nf-form-error">{error || "Sprint not found."}</div></main>
      </div><Footer /></div>
    );
  }

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/sprints/${sprintId}`)}>← Back to Sprint Board</span>
          <h1 className="nf-page-title">{sprint.name} — List View</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <input
                className="nf-search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="nf-select-filter" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                <option value="title">Sort by Summary</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Summary</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="clickable" onClick={() => navigate(`/tasks/${t.id}`)}>
                      <td><b>{taskKey(t.id)}</b></td>
                      <td>{t.title}</td>
                      <td>{t.assignee?.name || "Unassigned"}</td>
                      <td><span className={`nf-badge ${PRIORITY_CLASS[t.priority] || ""}`}>{t.priority}</span></td>
                      <td><span className="nf-badge">{t.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="nf-empty-state">No tasks match your search.</div>}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ListView;
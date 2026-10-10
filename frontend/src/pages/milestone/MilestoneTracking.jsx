import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllMilestones } from "../../services/milestoneService";

const STATUS_CLASS = {
  Pending:     "status-todo",
  "In Progress": "status-inprogress",
  Completed:   "status-done",
};

const isOverdue = (m) =>
  m.dueDate && m.status !== "Completed" && new Date(m.dueDate) < new Date();

const MilestoneTracking = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllMilestones()
      .then((data) => { if (!cancelled) setMilestones(Array.isArray(data) ? data : []); })
      .catch(() => { if (!cancelled) setError("Could not load milestones."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => ({
    total:      milestones.length,
    pending:    milestones.filter((m) => m.status === "Pending").length,
    inProgress: milestones.filter((m) => m.status === "In Progress").length,
    completed:  milestones.filter((m) => m.status === "Completed").length,
    overdue:    milestones.filter(isOverdue).length,
  }), [milestones]);

  const visible = useMemo(() => milestones.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.project?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || m.status === statusFilter;
    return matchSearch && matchStatus;
  }), [milestones, search, statusFilter]);

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Milestone Tracking</h1>

          {error && <div className="nf-form-error">{error}</div>}

          {!loading && (
            <div className="nf-stat-grid" style={{ marginBottom: 22 }}>
              <div className="nf-card">
                <div className="nf-stat-label">Total</div>
                <div className="nf-stat-value">{stats.total}</div>
                <div className="nf-stat-tag">milestones</div>
              </div>
              <div className="nf-card">
                <div className="nf-stat-label">In Progress</div>
                <div className="nf-stat-value" style={{ color: "#fcd34d" }}>{stats.inProgress}</div>
                <div className="nf-stat-tag">active</div>
              </div>
              <div className="nf-card">
                <div className="nf-stat-label">Completed</div>
                <div className="nf-stat-value" style={{ color: "var(--nf-success)" }}>{stats.completed}</div>
                <div className="nf-stat-tag">done</div>
              </div>
              <div className="nf-card">
                <div className="nf-stat-label">Overdue</div>
                <div className="nf-stat-value" style={{ color: stats.overdue > 0 ? "#f87171" : undefined }}>
                  {stats.overdue}
                </div>
                <div className="nf-stat-tag">past due date</div>
              </div>
            </div>
          )}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <input
                className="nf-search-input"
                placeholder="Search milestones or projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="nf-select-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <button className="nf-btn" onClick={() => navigate("/milestones/create")}>
                + Add Milestone
              </button>
            </div>

            {loading && <div className="nf-loading" style={{ minHeight: 120 }}>Loading milestones...</div>}

            {!loading && visible.length === 0 && (
              <div className="nf-empty-state">
                {milestones.length === 0 ? "No milestones yet. Click \"+ Add Milestone\" to create one." : "No milestones match your filters."}
              </div>
            )}

            {!loading && visible.length > 0 && (
              <div className="nf-table-wrap">
                <table className="nf-table">
                  <thead>
                    <tr>
                      <th>Milestone</th>
                      <th>Project</th>
                      <th>Due Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((m) => (
                      <tr key={m.id} className="clickable" onClick={() => navigate(`/milestones/${m.id}`)}>
                        <td>
                          <b>{m.name}</b>
                          {isOverdue(m) && (
                            <span className="nf-badge priority-high" style={{ marginLeft: 8 }}>Overdue</span>
                          )}
                        </td>
                        <td>{m.project?.name || <span style={{ color: "var(--nf-text-faint)" }}>Unassigned</span>}</td>
                        <td style={{ color: isOverdue(m) ? "#f87171" : undefined }}>{m.dueDate || "—"}</td>
                        <td><span className={`nf-badge ${STATUS_CLASS[m.status] || ""}`}>{m.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MilestoneTracking;

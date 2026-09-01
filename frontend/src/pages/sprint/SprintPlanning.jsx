import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllSprints } from "../../services/sprintService";

const FALLBACK_SPRINTS = [
  { id: "1", name: "Sprint 12", project: { name: "FinCore Nexus" }, taskCount: 23, points: 67, status: "Active" },
];

const SprintPlanning = () => {
  const navigate = useNavigate();
  const [sprints, setSprints] = useState(FALLBACK_SPRINTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllSprints()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setSprints(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the Sprint Service — showing sample data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Sprint Planning</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <div style={{ flex: 1 }} />
              <button className="nf-btn" onClick={() => navigate("/sprints/create")}>
                + Plan Sprint
              </button>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Sprint</th>
                    <th>Project</th>
                    <th>Tasks</th>
                    <th>Points</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sprints.map((s) => (
                    <tr key={s.id} className="clickable" onClick={() => navigate(`/sprints/${s.id}`)}>
                      <td><b>{s.name}</b></td>
                      <td>{s.project?.name || "Unassigned"}</td>
                      <td>{s.taskCount ?? 0}</td>
                      <td>{s.points ?? 0}</td>
                      <td><span className="nf-badge">{s.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && sprints.length === 0 && (
                <div className="nf-empty-state">No sprints planned yet.</div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SprintPlanning;
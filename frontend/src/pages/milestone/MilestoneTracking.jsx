import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllMilestones } from "../../services/milestoneService";

const FALLBACK_MILESTONES = [
  { id: "1", name: "Release 2.3", project: { name: "FinCore Nexus" }, dueDate: "2026-06-20", status: "Pending" },
];

const MilestoneTracking = () => {
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState(FALLBACK_MILESTONES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getAllMilestones()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setMilestones(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the Milestone Service — showing sample data.");
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
          <h1 className="nf-page-title">Milestone Tracking</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <div style={{ flex: 1 }} />
              <button className="nf-btn" onClick={() => navigate("/milestones/create")}>
                + Add Milestone
              </button>
            </div>

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
                  {milestones.map((m) => (
                    <tr key={m.id} className="clickable" onClick={() => navigate(`/milestones/${m.id}`)}>
                      <td><b>{m.name}</b></td>
                      <td>{m.project?.name || "Unassigned"}</td>
                      <td>{m.dueDate || "—"}</td>
                      <td><span className="nf-badge">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && milestones.length === 0 && (
                <div className="nf-empty-state">No milestones tracked yet.</div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MilestoneTracking;
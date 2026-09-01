import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllTeams, deleteTeam } from "../../services/teamService";

const FALLBACK_TEAMS = [
  { id: "1", name: "Backend", project: { name: "FinCore Nexus" }, memberCount: 5 },
  { id: "2", name: "Frontend", project: { name: "FinCore Nexus" }, memberCount: 3 },
  { id: "3", name: "QA", project: { name: "FinCore Nexus" }, memberCount: 3 },
  { id: "4", name: "DevOps", project: { name: "FinCore Nexus" }, memberCount: 2 },
];

const TeamManagement = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState(FALLBACK_TEAMS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeams = () => {
    getAllTeams()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setTeams(data);
      })
      .catch(() => setError("Could not reach the Team Service — showing sample data."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteTeam(id);
      setTeams((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Failed to delete team. Please try again.");
    }
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Team Management</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <div style={{ flex: 1 }} />
              <button className="nf-btn secondary" onClick={() => navigate("/teams/assign")}>
                Assign Team
              </button>
              <button className="nf-btn" onClick={() => navigate("/teams/create")}>
                + Create Team
              </button>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Team Name</th>
                    <th>Project</th>
                    <th>Members</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.id}>
                      <td><b>{t.name}</b></td>
                      <td>{t.project?.name || "Unassigned"}</td>
                      <td>{t.memberCount ?? 0}</td>
                      <td>
                        <button className="nf-link-btn danger" onClick={() => handleDelete(t.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && teams.length === 0 && (
                <div className="nf-empty-state">No teams yet. Create your first one.</div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TeamManagement;
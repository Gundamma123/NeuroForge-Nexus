import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getTeamById, deleteTeam } from "../../services/teamService";

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTeamById(id)
      .then((data) => setTeam(data))
      .catch(() => setError("Unable to load this team."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await deleteTeam(id);
      navigate("/teams");
    } catch {
      setError("Failed to delete team.");
    }
  };

  if (loading) {
    return (
      <div className="nf-app">
        <Navbar />
        <div className="nf-body">
          <Sidebar />
          <main className="nf-main">
            <div className="nf-loading">Loading team...</div>
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
          <span className="nf-back-link" onClick={() => navigate("/teams")}>
            ← Back to Team Management
          </span>

          {error && <div className="nf-form-error">{error}</div>}

          {team && (
            <div className="nf-panel">
              <h1 className="nf-page-title" style={{ marginBottom: 4 }}>{team.name}</h1>

              <div className="nf-detail-grid" style={{ marginTop: 16 }}>
                <div className="nf-card">
                  <div className="nf-stat-label">Project</div>
                  <div className="nf-detail-row" style={{ margin: 0 }}>
                    {team.project?.name || "Unassigned"}
                  </div>
                </div>
                <div className="nf-card">
                  <div className="nf-stat-label">Team Size</div>
                  <div className="nf-stat-value" style={{ fontSize: 22 }}>
                    {team.members?.length ?? team.memberCount ?? 0}
                  </div>
                </div>
              </div>

              <div className="nf-actions">
                <button className="nf-btn" onClick={() => navigate(`/teams/${team.id}/members`)}>
                  View Members
                </button>
                <button className="nf-btn secondary" onClick={handleDelete}>
                  Delete Team
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TeamDetails;
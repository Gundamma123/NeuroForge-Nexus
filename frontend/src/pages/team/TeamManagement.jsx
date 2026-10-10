import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllTeams, getTeamsByProject, deleteTeam } from "../../services/teamService";

const TeamManagement = () => {
  const navigate = useNavigate();
  const { projectId } = useParams(); // present only on /projects/:projectId/teams
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeams = () => {
    const fetchTeams = projectId ? getTeamsByProject(projectId) : getAllTeams();
    fetchTeams
      .then((data) => setTeams(Array.isArray(data) ? data : []))
      .catch(() => setError("Could not reach the Team Service."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

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
          {projectId && (
            <span className="nf-back-link" onClick={() => navigate(`/projects/${projectId}`)}>
              ← Back to Project
            </span>
          )}

          <h1 className="nf-page-title">Team Management</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <div style={{ flex: 1 }} />
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
                    <th>Team Size</th>
                    <th>Members</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((t) => (
                    <tr key={t.id}>
                      <td><b>{t.name}</b></td>
                      <td>{t.project?.name || "Unassigned"}</td>
                      <td>{t.memberCount ?? (t.members?.length || 0)}</td>
                      <td>
                        <button className="nf-link-btn" onClick={() => navigate(`/teams/${t.id}/members`)}>
                          {t.members?.length || t.memberCount || 0} Members
                        </button>
                      </td>
                      <td>
                        <div className="nf-table-actions">
                          <button className="nf-link-btn" onClick={() => navigate(`/teams/${t.id}/members`)}>View</button>
                          <button className="nf-link-btn danger" onClick={() => handleDelete(t.id)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && teams.length === 0 && (
                <div className="nf-empty-state">
                  {projectId ? "No teams assigned to this project." : "No teams yet. Create your first one."}
                </div>
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
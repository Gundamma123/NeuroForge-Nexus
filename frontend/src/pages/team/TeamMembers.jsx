import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getTeamById, removeMemberFromTeam } from "../../services/teamService";

const ROLE_CLASS = {
  "Frontend Developer": "role-dev",
  "Backend Developer": "role-devops",
  "Full Stack Developer": "role-admin",
  "Product Manager": "role-pm",
  "QA Tester": "role-tester",
};

const TeamMembers = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    getTeamById(id)
      .then((data) => setTeam(data))
      .catch(() => setError("Unable to load team members."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleRemove = async (memberId) => {
    try {
      const updated = await removeMemberFromTeam(id, memberId);
      setTeam(updated);
    } catch {
      setError("Failed to remove member from team.");
    }
  };

  if (loading) {
    return (<div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
      <main className="nf-main"><div className="nf-loading">Loading members...</div></main>
    </div><Footer /></div>);
  }

  const members = team?.members || [];

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate("/teams")}>← Back to Team Management</span>
          <h1 className="nf-page-title">{team?.name} — Members</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th><th>Experience</th><th>Skills</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}>
                      <td><b>{m.name}</b></td>
                      <td>{m.email}</td>
                      <td><span className={`nf-badge ${ROLE_CLASS[m.role] || ""}`}>{m.role}</span></td>
                      <td>{m.experienceYears ?? 0} yrs</td>
                      <td>{m.skills || "—"}</td>
                      <td>
                        <button className="nf-link-btn danger" onClick={() => handleRemove(m.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {members.length === 0 && <div className="nf-empty-state">No members assigned to this team yet.</div>}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default TeamMembers;
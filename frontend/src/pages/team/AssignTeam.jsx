import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllTeams, updateTeam } from "../../services/teamService";
import { getAllProjects } from "../../services/projectService";

const AssignTeam = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ teamId: "", projectId: "", memberCount: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([getAllTeams(), getAllProjects()])
      .then(([teamData, projectData]) => {
        setTeams(Array.isArray(teamData) ? teamData : []);
        setProjects(Array.isArray(projectData) ? projectData : []);
      })
      .catch(() => setError("Could not load teams or projects."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTeamSelect = (e) => {
    const teamId = e.target.value;
    const selected = teams.find((t) => String(t.id) === teamId);
    setForm({
      teamId,
      projectId: selected?.project?.id ? String(selected.project.id) : "",
      memberCount: selected?.memberCount ?? "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!form.teamId) {
      setError("Select a team to assign.");
      return;
    }

    setSaving(true);
    try {
      const selected = teams.find((t) => String(t.id) === form.teamId);
      await updateTeam(form.teamId, {
        name: selected?.name,
        projectId: form.projectId ? Number(form.projectId) : null,
        memberCount: form.memberCount ? Number(form.memberCount) : 0,
      });
      setSuccess(true);
    } catch {
      setError("Failed to assign team. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Assign Team</h1>

          <div className="nf-panel" style={{ maxWidth: 480 }}>
            {error && <div className="nf-form-error">{error}</div>}
            {success && (
              <div
                className="nf-form-error"
                style={{ background: "rgba(52,211,153,0.1)", borderColor: "rgba(52,211,153,0.35)", color: "#6ee7b7" }}
              >
                Team assignment updated successfully.
              </div>
            )}

            {loading ? (
              <p className="nf-detail-row">Loading teams and projects...</p>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="nf-field">
                  <label htmlFor="teamId">Team</label>
                  <select id="teamId" name="teamId" value={form.teamId} onChange={handleTeamSelect}>
                    <option value="">Select a team</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="nf-field">
                  <label htmlFor="projectId">Assign to Project</label>
                  <select id="projectId" name="projectId" value={form.projectId} onChange={handleChange}>
                    <option value="">Unassigned</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="nf-field">
                  <label htmlFor="memberCount">Member Count</label>
                  <input
                    id="memberCount"
                    name="memberCount"
                    type="number"
                    min="0"
                    value={form.memberCount}
                    onChange={handleChange}
                  />
                </div>

                <div className="nf-actions" style={{ marginTop: 4 }}>
                  <button type="submit" className="nf-btn" disabled={saving}>
                    {saving ? "Saving..." : "Save Assignment"}
                  </button>
                  <button type="button" className="nf-btn secondary" onClick={() => navigate("/teams")}>
                    Back to Teams
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AssignTeam;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { createTeam } from "../../services/teamService";
import { getAllProjects } from "../../services/projectService";

const CreateTeam = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", projectId: "", memberCount: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAllProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]));
  }, []);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Team name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        projectId: form.projectId ? Number(form.projectId) : null,
        memberCount: form.memberCount ? Number(form.memberCount) : 0,
      };
      await createTeam(payload);
      navigate("/teams");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Failed to create team.");
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
          <h1 className="nf-page-title">Create Team</h1>

          <div className="nf-panel" style={{ maxWidth: 480 }}>
            {serverError && <div className="nf-form-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="nf-field">
                <label htmlFor="name">Team Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Backend" />
                {errors.name && <div className="nf-field-error">{errors.name}</div>}
              </div>

              <div className="nf-field">
                <label htmlFor="projectId">Project</label>
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
                  placeholder="e.g. 5"
                />
              </div>

              <div className="nf-actions" style={{ marginTop: 4 }}>
                <button type="submit" className="nf-btn" disabled={saving}>
                  {saving ? "Creating..." : "Create Team"}
                </button>
                <button type="button" className="nf-btn secondary" onClick={() => navigate("/teams")}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CreateTeam;
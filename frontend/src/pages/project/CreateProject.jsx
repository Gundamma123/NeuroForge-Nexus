import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { createProject } from "../../services/projectService";

const STATUSES = ["Active", "On Hold", "Completed"];

const CreateProject = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", status: "Active", teamSize: "", description: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Project name is required";
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
        ...form,
        teamSize: form.teamSize ? Number(form.teamSize) : 0,
      };
      const created = await createProject(payload);
      navigate(`/projects/${created.id}`);
    } catch (err) {
      setServerError(err?.response?.data?.message || "Failed to create project. Please try again.");
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
          <h1 className="nf-page-title">Create Project</h1>

          <div className="nf-panel" style={{ maxWidth: 480 }}>
            {serverError && <div className="nf-form-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="nf-field">
                <label htmlFor="name">Project Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. FinCore Nexus" />
                {errors.name && <div className="nf-field-error">{errors.name}</div>}
              </div>

              <div className="nf-field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="nf-field">
                <label htmlFor="teamSize">Team Size</label>
                <input
                  id="teamSize"
                  name="teamSize"
                  type="number"
                  min="0"
                  value={form.teamSize}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                />
              </div>

              <div className="nf-field">
                <label htmlFor="description">Description</label>
                <input
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short project summary"
                />
              </div>

              <div className="nf-actions" style={{ marginTop: 4 }}>
                <button type="submit" className="nf-btn" disabled={saving}>
                  {saving ? "Creating..." : "Create Project"}
                </button>
                <button type="button" className="nf-btn secondary" onClick={() => navigate("/projects")}>
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

export default CreateProject;
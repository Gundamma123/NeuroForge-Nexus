import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import FormShell from "../../components/FormShell";
import { createProject } from "../../services/projectService";

const STATUSES = ["Active", "On Hold", "Completed"];

const CreateProject = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", status: "Active", teamSize: "", description: "" });
  const [errors, setErrors] = useState({});
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
      setErrors({ name: err?.response?.data?.message || "Failed to create project. Please try again." });
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

          <form onSubmit={handleSubmit}>
            <FormShell
              error={errors.name}
              main={
                <>
                  <div className="nf-field">
                    <label>Project Name</label>
                    <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. FinCore Nexus" />
                  </div>
                  <div className="nf-field">
                    <label>Description</label>
                    <textarea name="description" value={form.description} onChange={handleChange} placeholder="Short project summary" />
                  </div>
                </>
              }
              sidebar={
                <>
                  <div className="nf-field">
                    <label>Status</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="nf-field">
                    <label>Team Size</label>
                    <input name="teamSize" type="number" min="0" value={form.teamSize} onChange={handleChange} placeholder="e.g. 12" />
                  </div>
                </>
              }
              actions={
                <>
                  <button type="submit" className="nf-btn" disabled={saving}>
                    {saving ? "Creating..." : "Create Project"}
                  </button>
                  <button type="button" className="nf-btn secondary" onClick={() => navigate("/projects")}>
                    Cancel
                  </button>
                </>
              }
            />
          </form>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CreateProject;
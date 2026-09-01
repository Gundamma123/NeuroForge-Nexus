import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { createMilestone } from "../../services/milestoneService";
import { getAllProjects } from "../../services/projectService";

const STATUSES = ["Pending", "In Progress", "Completed"];

const CreateMilestone = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", projectId: "", dueDate: "", status: "Pending" });
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
    if (!form.name.trim()) next.name = "Milestone name is required";
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
        projectId: form.projectId ? Number(form.projectId) : null,
        dueDate: form.dueDate || null,
      };
      const created = await createMilestone(payload);
      navigate(`/milestones/${created.id}`);
    } catch (err) {
      setServerError(err?.response?.data?.message || "Failed to create milestone.");
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
          <h1 className="nf-page-title">Add Milestone</h1>

          <div className="nf-panel" style={{ maxWidth: 480 }}>
            {serverError && <div className="nf-form-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="nf-field">
                <label htmlFor="name">Milestone Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Release 2.3" />
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
                <label htmlFor="dueDate">Due Date</label>
                <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
              </div>

              <div className="nf-field">
                <label htmlFor="status">Status</label>
                <select id="status" name="status" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="nf-actions" style={{ marginTop: 4 }}>
                <button type="submit" className="nf-btn" disabled={saving}>
                  {saving ? "Creating..." : "Add Milestone"}
                </button>
                <button type="button" className="nf-btn secondary" onClick={() => navigate("/milestones")}>
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

export default CreateMilestone;
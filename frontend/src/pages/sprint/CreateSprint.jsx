import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { createSprint } from "../../services/sprintService";
import { getAllProjects } from "../../services/projectService";

const STATUSES = ["Active", "Planned", "Completed"];

const CreateSprint = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    projectId: "",
    taskCount: "",
    points: "",
    startDate: "",
    endDate: "",
    status: "Planned",
  });
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
    if (!form.name.trim()) next.name = "Sprint name is required";
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
        taskCount: form.taskCount ? Number(form.taskCount) : 0,
        points: form.points ? Number(form.points) : 0,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      const created = await createSprint(payload);
      navigate(`/sprints/${created.id}`);
    } catch (err) {
      setServerError(err?.response?.data?.message || "Failed to create sprint.");
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
          <h1 className="nf-page-title">Plan Sprint</h1>

          <div className="nf-panel" style={{ maxWidth: 480 }}>
            {serverError && <div className="nf-form-error">{serverError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="nf-field">
                <label htmlFor="name">Sprint Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Sprint 13" />
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
                <label htmlFor="taskCount">Task Count</label>
                <input id="taskCount" name="taskCount" type="number" min="0" value={form.taskCount} onChange={handleChange} />
              </div>

              <div className="nf-field">
                <label htmlFor="points">Story Points</label>
                <input id="points" name="points" type="number" min="0" value={form.points} onChange={handleChange} />
              </div>

              <div className="nf-field">
                <label htmlFor="startDate">Start Date</label>
                <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} />
              </div>

              <div className="nf-field">
                <label htmlFor="endDate">End Date</label>
                <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={handleChange} />
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
                  {saving ? "Creating..." : "Create Sprint"}
                </button>
                <button type="button" className="nf-btn secondary" onClick={() => navigate("/sprints")}>
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

export default CreateSprint;
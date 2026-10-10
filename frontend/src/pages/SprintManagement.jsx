import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import {
  getAllSprints,
  getSprintsByProject,
  createSprint,
  deleteSprint,
} from "../services/sprintService";
import { getAllProjects } from "../services/projectService";
import FormShell from "../components/FormShell";

const STATUS_CLASS = {
  Planned: "role-pm",
  Active: "",
  Completed: "role-dev",
  Cancelled: "role-admin",
};

const STATUSES = [
  "Planned",
  "Active",
  "Completed",
  "Cancelled",
];

const SprintManagement = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [sprints, setSprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    projectId: projectId || "",
    goal: "",
    startDate: "",
    endDate: "",
    status: "Planned",
  });

  const loadSprints = () => {
    setLoading(true);

    const fetcher = projectId
      ? getSprintsByProject(projectId)
      : getAllSprints();

    fetcher
      .then((data) => {
        setSprints(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError(
          "Unable to load sprints. Please try again."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    setError("");

    loadSprints();

    getAllProjects()
      .then((data) => {
        setProjects(
          Array.isArray(data) ? data : []
        );
      })
      .catch(() => {
        setProjects([]);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      name: "",
      projectId: projectId || "",
      goal: "",
      startDate: "",
      endDate: "",
      status: "Planned",
    });
  };

  const openCreateModal = () => {
    setError("");
    resetForm();
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Sprint name is required.");
      return;
    }

    if (!form.projectId) {
      setError("Please select a project.");
      return;
    }

    if (!form.startDate) {
      setError("Start date is required.");
      return;
    }

    if (!form.endDate) {
      setError("End date is required.");
      return;
    }

    if (form.endDate <= form.startDate) {
      setError("End date must be after start date.");
      return;
    }

    setSaving(true);

    try {
      await createSprint({
        ...form,
        projectId: Number(form.projectId),
        startDate: form.startDate,
        endDate: form.endDate,
      });

      setModalOpen(false);
      resetForm();
      loadSprints();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to create sprint."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this sprint?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteSprint(id);

      setSprints((prev) =>
        prev.filter((sprint) => sprint.id !== id)
      );
    } catch {
      setError("Failed to delete sprint.");
    }
  };

  const currentProject = projects.find(
    (p) => String(p.id) === String(projectId)
  );

  return (
    <div className="nf-app">
      <Navbar />

      <div className="nf-body">
        <Sidebar />

        <main className="nf-main">
          {projectId && (
            <span
              className="nf-back-link"
              onClick={() =>
                navigate(`/projects/${projectId}`)
              }
            >
              ← Back to Project
            </span>
          )}

          {currentProject && (
            <div
              className="nf-panel"
              style={{
                marginBottom: 16,
                padding: "14px 20px",
              }}
            >
              <div className="nf-stat-label">
                Project
              </div>

              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--nf-text)",
                }}
              >
                {currentProject.name}
              </div>
            </div>
          )}

          <h1 className="nf-page-title">
            Sprints
          </h1>

          {error && (
            <div className="nf-form-error">
              {error}
            </div>
          )}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <div style={{ flex: 1 }} />

              <button
                className="nf-btn"
                onClick={openCreateModal}
              >
                + Create Sprint
              </button>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Sprint Name</th>
                    <th>Project</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Tasks</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sprints.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <b>{s.name}</b>
                      </td>

                      <td>
                        {s.project?.name ||
                          currentProject?.name ||
                          "Unassigned"}
                      </td>

                      <td>
                        {s.startDate || "—"}
                      </td>

                      <td>
                        {s.endDate || "—"}
                      </td>

                      <td>
                        <span
                          className={`nf-badge ${
                            STATUS_CLASS[s.status] || ""
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>

                      <td>
                        {s.taskCount ?? 0} Tasks
                      </td>

                      <td>
                        <div className="nf-table-actions">
                          <button
                            className="nf-link-btn"
                            onClick={() =>
                              navigate(
                                `/sprints/${s.id}`
                              )
                            }
                          >
                            View
                          </button>

                          <button
                            className="nf-link-btn danger"
                            onClick={() =>
                              handleDelete(s.id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading &&
                sprints.length === 0 && (
                  <div className="nf-empty-state">
                    {projectId
                      ? "No sprints found for this project."
                      : "No sprints found."}
                  </div>
                )}

              {loading && (
                <div className="nf-empty-state">
                  Loading sprints...
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <Footer />

      {/* Create Sprint Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setError("");
          }
        }}
        title="Create Sprint"
        wide
      >
        <form onSubmit={handleCreate}>
          <FormShell
            asPanel={false}
            error={error}
            main={
              <>
                <div className="nf-field">
                  <label>Sprint Name</label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Sprint 1"
                    required
                  />
                </div>

                <div className="nf-field">
                  <label>
                    Goal / Description
                  </label>

                  <textarea
                    name="goal"
                    value={form.goal}
                    onChange={handleChange}
                    placeholder="Sprint objective..."
                    required
                  />
                </div>
              </>
            }
            sidebar={
              <>
                <div className="nf-field">
                  <label>Project</label>

                  <select
                    name="projectId"
                    value={form.projectId}
                    onChange={handleChange}
                    disabled={!!projectId}
                    required
                  >
                    <option value="">
                      Select Project
                    </option>

                    {projects.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nf-field">
                  <label>Start Date</label>

                  <input
                    name="startDate"
                    type="date"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="nf-field">
                  <label>End Date</label>

                  <input
                    name="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="nf-field">
                  <label>Status</label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            }
            actions={
              <>
                <button
                  type="submit"
                  className="nf-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : "Create Sprint"}
                </button>

                <button
                  type="button"
                  className="nf-btn secondary"
                  onClick={() => {
                    setModalOpen(false);
                    setError("");
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </>
            }
          />
        </form>
      </Modal>
    </div>
  );
};

export default SprintManagement;
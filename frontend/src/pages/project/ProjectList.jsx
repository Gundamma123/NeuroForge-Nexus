import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Modal from "../../components/Modal";
import { getAllProjects, deleteProject } from "../../services/projectService";
import { getTeamsByProject } from "../../services/teamService";

const FALLBACK_PROJECTS = [
  { id: "1", name: "FinCore Nexus", status: "Active", teamSize: 12, description: "Enterprise banking core platform." },
];

const ProjectList = () => {
  const navigate = useNavigate();
  // const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTeams, setModalTeams] = useState([]);
  const [modalProjectName, setModalProjectName] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllProjects()
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setProjects(data);
      })
      .catch(() => {
        if (!cancelled) setError("Could not reach the Project Service — showing sample data.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openTeamPopup = async (project, e) => {
    e.stopPropagation();
    setModalProjectName(project.name);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const teams = await getTeamsByProject(project.id);
      setModalTeams(Array.isArray(teams) ? teams : []);
    } catch {
      setModalTeams([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveClick = (project, e) => {
    e.stopPropagation();
    setConfirmDeleteId(project.id);
  };

  const confirmDelete = async () => {
    setDeleting(true);
    setError("");
    try {
      await deleteProject(confirmDeleteId);
      setProjects((prev) => prev.filter((p) => p.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } catch {
      setError("Failed to delete project. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const projectToDelete = projects.find((p) => p.id === confirmDeleteId);

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Projects</h1>
          <div className="nf-stat-grid" style={{ marginBottom: 20 }}>
  <div className="nf-card">
    <div className="nf-stat-label">Total Projects</div>
    <div className="nf-stat-value">{projects.length}</div>
  </div>
  <div className="nf-card">
    <div className="nf-stat-label">Active</div>
    <div className="nf-stat-value">{projects.filter((p) => p.status === "Active").length}</div>
  </div>
  <div className="nf-card">
    <div className="nf-stat-label">On Hold</div>
    <div className="nf-stat-value">{projects.filter((p) => p.status === "On Hold").length}</div>
  </div>
  <div className="nf-card">
    <div className="nf-stat-label">Completed</div>
    <div className="nf-stat-value">{projects.filter((p) => p.status === "Completed").length}</div>
  </div>
</div>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              <div style={{ flex: 1 }} />
              <button className="nf-btn" onClick={() => navigate("/projects/create")}>
                + Create Project
              </button>
            </div>

            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Team Size</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="clickable" onClick={() => navigate(`/projects/${p.id}`)}>
                      <td><b>{p.name}</b></td>
                      <td><span className="nf-badge">{p.status}</span></td>
                      <td>
                        <span className="nf-pop-trigger" onClick={(e) => openTeamPopup(p, e)}>
                          {p.teamSize ?? 0} Members
                        </span>
                      </td>
                      <td>{p.description || "—"}</td>
                      <td>
                        <button
                          className="nf-link-btn danger"
                          onClick={(e) => handleRemoveClick(p, e)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && projects.length === 0 && (
                <div className="nf-empty-state">No projects yet. Create your first one.</div>
              )}
            </div>
          </div>
        </main>
      </div>
      <Footer />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`${modalProjectName} — Teams`}
      >
        {modalLoading ? (
          <p className="nf-detail-row">Loading teams...</p>
        ) : modalTeams.length === 0 ? (
          <div className="nf-empty-state">No teams assigned to this project yet.</div>
        ) : (
          modalTeams.map((t) => (
            <div
              key={t.id}
              className="nf-detail-row"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span><b>{t.name}</b></span>
              <span className="nf-badge">{t.members?.length ?? t.memberCount ?? 0} Members</span>
            </div>
          ))
        )}
      </Modal>

      <Modal
        open={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        title="Delete Project"
      >
        <p className="nf-detail-row">
          Are you sure you want to delete <b>{projectToDelete?.name}</b>? This action cannot
          be undone.
        </p>
        <div className="nf-actions">
          <button className="nf-btn" style={{ background: "#dc2626" }} onClick={confirmDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Yes, Delete"}
          </button>
          <button className="nf-btn secondary" onClick={() => setConfirmDeleteId(null)}>
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectList;
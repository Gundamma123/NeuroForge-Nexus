import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllProjects } from "../../services/projectService";

const FALLBACK_PROJECTS = [
  { id: "1", name: "FinCore Nexus", status: "Active", teamSize: 12, description: "Enterprise banking core platform." },
];

const ProjectList = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Projects</h1>

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
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p.id} className="clickable" onClick={() => navigate(`/projects/${p.id}`)}>
                      <td><b>{p.name}</b></td>
                      <td><span className="nf-badge">{p.status}</span></td>
                      <td>{p.teamSize ?? "—"}</td>
                      <td>{p.description || "—"}</td>
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
    </div>
  );
};

export default ProjectList;
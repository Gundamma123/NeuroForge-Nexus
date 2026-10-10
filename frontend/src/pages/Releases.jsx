import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { getAllProjects } from "../services/projectService";
import { getRepoLink, getRepoActivity } from "../services/githubService";

const Releases = () => {
  const [rows, setRows] = useState([]); // [{ project, link, releases }]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getAllProjects()
      .then(async (projects) => {
        const list = Array.isArray(projects) ? projects : [];
        const results = await Promise.all(
          list.map(async (project) => {
            try {
              const link = await getRepoLink(project.id);
              if (!link) return { project, link: null, releases: [] };
              const releases = await getRepoActivity(project.id, "releases");
              return { project, link, releases: Array.isArray(releases) ? releases : [] };
            } catch {
              return { project, link: null, releases: [] };
            }
          })
        );
        if (!cancelled) setRows(results);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const projectKey = (id) => `PRJ-${1000 + id}`;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Releases</h1>
          <p className="nf-detail-row" style={{ marginTop: -8 }}>
            Published GitHub releases for every project with a linked repository.
          </p>

          {loading && <div className="nf-loading">Loading releases...</div>}

          {!loading && (
            <div className="nf-panel">
              <div className="nf-table-wrap">
                <table className="nf-table">
                  <thead>
                    <tr><th>Project</th><th>ID</th><th>Releases</th><th>Latest</th></tr>
                  </thead>
                  <tbody>
                    {rows.map(({ project, link, releases }) => {
                      const latest = releases[0];
                      return (
                        <tr key={project.id}>
                          <td><b>{project.name}</b></td>
                          <td style={{ color: "var(--nf-cyan-soft)" }}>{projectKey(project.id)}</td>
                          <td>{releases.length} releases</td>
                          <td>
                            {!link ? (
                              <span style={{ color: "var(--nf-text-faint)" }}>Not connected</span>
                            ) : latest ? (
                              <a href={latest.url} target="_blank" rel="noreferrer">
                                {latest.tag}{latest.prerelease ? " (pre-release)" : ""}
                              </a>
                            ) : (
                              <span style={{ color: "var(--nf-text-faint)" }}>0 released</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Releases;
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, File as FileIcon, Folder, GitBranch } from "lucide-react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getProjectById } from "../../services/projectService";
import { getRepoLink, getBranches, getTree, getFile, getReadme } from "../../services/githubService";

const errorText = (err, fallback) => err?.response?.data?.message || fallback;

const formatSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const RepositoryBrowser = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [link, setLink] = useState(null);
  const [branches, setBranches] = useState([]);
  const [branch, setBranch] = useState("");
  const [path, setPath] = useState("");
  const [entries, setEntries] = useState([]);
  const [filePath, setFilePath] = useState("");
  const [file, setFile] = useState(null);
  const [readme, setReadme] = useState(null);

  const [loading, setLoading] = useState(true);
  const [treeLoading, setTreeLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState("");

  // Project, linked repo and branch list
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.allSettled([getProjectById(projectId), getRepoLink(projectId)]).then(async ([p, l]) => {
      if (cancelled) return;
      if (p.status === "fulfilled") setProject(p.value);
      const lk = l.status === "fulfilled" ? l.value : null;
      setLink(lk);
      if (!lk) { setLoading(false); return; }
      try {
        const b = await getBranches(projectId);
        if (cancelled) return;
        const list = Array.isArray(b?.branches) ? b.branches : [];
        setBranches(list);
        setBranch(b?.defaultBranch || list[0] || "");
      } catch (err) {
        if (!cancelled) setError(errorText(err, "Could not load the repository."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [projectId]);

  // Folder listing for the current branch + path
  useEffect(() => {
    if (!link || !branch) return undefined;
    let cancelled = false;
    setTreeLoading(true);
    setError("");
    getTree(projectId, branch, path)
      .then((d) => { if (!cancelled) setEntries(Array.isArray(d) ? d : []); })
      .catch((err) => {
        if (!cancelled) { setEntries([]); setError(errorText(err, "Could not load this folder.")); }
      })
      .finally(() => { if (!cancelled) setTreeLoading(false); });
    return () => { cancelled = true; };
  }, [link, projectId, branch, path]);

  // README of the branch (shown at the repository root)
  useEffect(() => {
    if (!link || !branch) return undefined;
    let cancelled = false;
    getReadme(projectId, branch)
      .then((d) => { if (!cancelled) setReadme(d); })
      .catch(() => { if (!cancelled) setReadme(null); });
    return () => { cancelled = true; };
  }, [link, projectId, branch]);

  // Selected file
  useEffect(() => {
    if (!filePath) { setFile(null); return undefined; }
    let cancelled = false;
    setFileLoading(true);
    setError("");
    getFile(projectId, branch, filePath)
      .then((d) => { if (!cancelled) setFile(d); })
      .catch((err) => {
        if (!cancelled) { setFile(null); setError(errorText(err, "Could not load this file.")); }
      })
      .finally(() => { if (!cancelled) setFileLoading(false); });
    return () => { cancelled = true; };
  }, [projectId, branch, filePath]);

  const goTo = (p) => { setPath(p); setFilePath(""); setFile(null); };

  const changeBranch = (name) => { setBranch(name); setPath(""); setFilePath(""); setFile(null); };

  const openEntry = (entry) => {
    if (entry.type === "dir") goTo(entry.path);
    else if (entry.type === "file") setFilePath(entry.path);
  };

  const segments = path ? path.split("/") : [];

  const renderBody = () => {
    if (loading) return <div className="nf-loading" style={{ minHeight: 160 }}>Loading repository...</div>;

    if (!link) {
      return (
        <div className="nf-panel">
          <div className="nf-empty-state">No GitHub repository is linked to this project yet.</div>
          <div className="nf-actions">
            <button className="nf-btn" onClick={() => navigate(`/projects/${projectId}`)}>Go to project</button>
          </div>
        </div>
      );
    }

    return (
      <div className="nf-panel">
        <div className="nf-browser-toolbar">
          <GitBranch size={16} />
          <select
            className="nf-select-filter"
            value={branch}
            onChange={(e) => changeBranch(e.target.value)}
            aria-label="Branch"
          >
            {branches.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <span className="nf-gh-repo">{link.repoOwner}/{link.repoName}</span>
        </div>

        {error && <div className="nf-form-error">{error}</div>}

        {filePath ? (
          <>
            <div className="nf-breadcrumb">
              <button onClick={() => setFilePath("")}>← Back to folder</button>
              <span>{filePath}</span>
            </div>

            {fileLoading ? (
              <div className="nf-empty-state">Loading file...</div>
            ) : file ? (
              <>
                <div className="nf-browser-fileinfo">
                  <span>{file.name} · {formatSize(file.size)}</span>
                  {file.htmlUrl && file.htmlUrl.startsWith("https://") && (
                    <a href={file.htmlUrl} target="_blank" rel="noreferrer">Open on GitHub</a>
                  )}
                </div>
                {file.content !== null && file.content !== undefined ? (
                  <pre className="nf-code-view">{file.content}</pre>
                ) : (
                  <div className="nf-empty-state">{file.note || "This file can't be previewed."}</div>
                )}
              </>
            ) : null}
          </>
        ) : (
          <>
            <div className="nf-breadcrumb">
              <button onClick={() => goTo("")}>{link.repoName}</button>
              {segments.map((seg, i) => {
                const target = segments.slice(0, i + 1).join("/");
                return (
                  <span key={target} className="nf-breadcrumb-part">
                    <ChevronRight size={13} />
                    <button onClick={() => goTo(target)}>{seg}</button>
                  </span>
                );
              })}
            </div>

            <div className="nf-gh-list">
              {treeLoading ? (
                <div className="nf-empty-state">Loading...</div>
              ) : entries.length === 0 ? (
                <div className="nf-empty-state">This folder is empty.</div>
              ) : (
                entries.map((e) => (
                  <div
                    key={e.path}
                    className={`nf-browser-row ${e.type === "dir" || e.type === "file" ? "clickable" : ""}`}
                    onClick={() => openEntry(e)}
                  >
                    {e.type === "dir" ? <Folder size={15} /> : <FileIcon size={15} />}
                    <span className="nf-gh-row-title">{e.name}</span>
                    {e.type === "file" && <span className="nf-gh-row-meta">{formatSize(e.size)}</span>}
                  </div>
                ))
              )}
            </div>

            {path === "" && readme && (
              <div style={{ marginTop: 18 }}>
                <h3 style={{ fontSize: 13, marginBottom: 8 }}>{readme.name || "README"}</h3>
                {readme.content ? (
                  <pre className="nf-readme">{readme.content}</pre>
                ) : (
                  <div className="nf-empty-state">{readme.note || "No README found."}</div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/projects/${projectId}`)}>
            ← Back to Project
          </span>
          <h1 className="nf-page-title">{project ? `${project.name} — Code` : "Code"}</h1>
          {renderBody()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default RepositoryBrowser;
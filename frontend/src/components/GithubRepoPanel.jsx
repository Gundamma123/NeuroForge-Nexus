// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { Github, ExternalLink, GitMerge, Plus, Code, Settings } from "lucide-react";
// import Modal from "./Modal";
// import {
//   connectGithub, getGithubStatus, getMyRepos, getRepoLink, linkRepo, unlinkRepo,
//   getRepoActivity, getTeamActivity, mergePullRequest, createIssue,
// } from "../services/githubService";

// const TABS = [
//   { key: "pulls", label: "Pull Requests" },
//   { key: "issues", label: "Issues" },
//   { key: "commits", label: "Commits" },
// ];

// const MERGE_METHODS = [
//   { value: "merge", label: "Create a merge commit" },
//   { value: "squash", label: "Squash and merge" },
//   { value: "rebase", label: "Rebase and merge" },
// ];

// const timeAgo = (iso) => {
//   if (!iso) return "";
//   const diff = Date.now() - new Date(iso).getTime();
//   if (Number.isNaN(diff)) return "";
//   const mins = Math.floor(diff / 60000);
//   if (mins < 1) return "just now";
//   if (mins < 60) return `${mins}m ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs}h ago`;
//   return `${Math.floor(hrs / 24)}d ago`;
// };

// const safeHref = (url) => (typeof url === "string" && url.startsWith("https://") ? url : undefined);
// const errorText = (err, fallback) => err?.response?.data?.message || fallback;

// // "Atlas Auth Service" and "atlas-auth-service" compare as equal
// const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// const findBestMatch = (projectName, repos) => {
//   const target = normalize(projectName);
//   if (!target) return null;
//   let match = repos.find((r) => normalize(r.name) === target);
//   if (match) return match;
//   match = repos.find((r) => {
//     const n = normalize(r.name);
//     return n && (n.includes(target) || target.includes(n));
//   });
//   return match || null;
// };

// const GithubRepoPanel = ({ projectId, projectName }) => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const [status, setStatus] = useState({ connected: false, githubUsername: null });
//   const [link, setLink] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [notice, setNotice] = useState("");
//   const [error, setError] = useState("");

//   const [picking, setPicking] = useState(false);
//   const [repos, setRepos] = useState([]);
//   const [reposLoading, setReposLoading] = useState(false);
//   const [selected, setSelected] = useState("");
//   const [suggestedRepo, setSuggestedRepo] = useState(null);
//   const [saving, setSaving] = useState(false);

//   const [tab, setTab] = useState("commits");
//   const [rows, setRows] = useState([]);
//   const [rowsLoading, setRowsLoading] = useState(false);
//   const [rowsError, setRowsError] = useState("");
//   const [reloadKey, setReloadKey] = useState(0);
//   const [labelFilter, setLabelFilter] = useState("");

//   const [teamActivity, setTeamActivity] = useState([]);

//   const [mergeTarget, setMergeTarget] = useState(null);
//   const [mergeMethod, setMergeMethod] = useState("merge");
//   const [merging, setMerging] = useState(false);
//   const [mergeError, setMergeError] = useState("");

//   const [issueOpen, setIssueOpen] = useState(false);
//   const [repoLabels, setRepoLabels] = useState([]);
//   const [issueForm, setIssueForm] = useState({ title: "", body: "", labels: [] });
//   const [issueSaving, setIssueSaving] = useState(false);
//   const [issueError, setIssueError] = useState("");

//   const showPicker = !loading && status.connected && (!link || picking);

//   // Initial load: my GitHub connection + this project's linked repository
//   useEffect(() => {
//     let cancelled = false;
//     setLoading(true);
//     Promise.allSettled([getGithubStatus(), getRepoLink(projectId)]).then(([s, l]) => {
//       if (cancelled) return;
//       if (s.status === "fulfilled" && s.value) setStatus(s.value);
//       setLink(l.status === "fulfilled" && l.value ? l.value : null);
//       setLoading(false);
//     });
//     return () => { cancelled = true; };
//   }, [projectId]);

//   // Message after returning from GitHub
//   useEffect(() => {
//     const result = searchParams.get("github");
//     if (result === "connected") setNotice("GitHub account connected.");
//     if (result === "error") setError("GitHub connection failed. Please try again.");
//   }, [searchParams]);

//   // Repositories for the dropdown (only while the picker is visible), with auto-match
//   useEffect(() => {
//     if (!showPicker) return undefined;
//     let cancelled = false;
//     setReposLoading(true);
//     getMyRepos()
//       .then((d) => {
//         if (cancelled) return;
//         const list = Array.isArray(d) ? d : [];
//         setRepos(list);
//         const match = findBestMatch(projectName, list);
//         setSuggestedRepo(match);
//         if (match) setSelected((prev) => prev || match.fullName);
//       })
//       .catch((err) => { if (!cancelled) setError(errorText(err, "Could not load your GitHub repositories.")); })
//       .finally(() => { if (!cancelled) setReposLoading(false); });
//     return () => { cancelled = true; };
//   }, [showPicker, projectName]);

//   // Pull requests / issues / commits of the linked repository
//   useEffect(() => {
//     if (!link) { setRows([]); return undefined; }
//     let cancelled = false;
//     setRowsLoading(true);
//     setRowsError("");
//     getRepoActivity(projectId, tab)
//       .then((d) => { if (!cancelled) setRows(Array.isArray(d) ? d : []); })
//       .catch((err) => {
//         if (!cancelled) { setRows([]); setRowsError(errorText(err, "Could not load GitHub data.")); }
//       })
//       .finally(() => { if (!cancelled) setRowsLoading(false); });
//     return () => { cancelled = true; };
//   }, [link, tab, projectId, reloadKey]);

//   // Last commit per connected teammate
//   useEffect(() => {
//     if (!link) { setTeamActivity([]); return undefined; }
//     let cancelled = false;
//     getTeamActivity(projectId)
//       .then((d) => { if (!cancelled) setTeamActivity(Array.isArray(d) ? d : []); })
//       .catch(() => { if (!cancelled) setTeamActivity([]); });
//     return () => { cancelled = true; };
//   }, [link, projectId]);

//   const handleConnect = async () => {
//     setError("");
//     try {
//       await connectGithub(window.location.pathname);
//     } catch {
//       setError("Could not start the GitHub connection. Please try again.");
//     }
//   };

//   const handleLink = async () => {
//     const repo = repos.find((r) => r.fullName === selected);
//     if (!repo) { setError("Select a repository first."); return; }
//     setSaving(true);
//     setError("");
//     setNotice("");
//     try {
//       const saved = await linkRepo(projectId, { repoOwner: repo.owner, repoName: repo.name });
//       setLink(saved);
//       setPicking(false);
//       setSelected("");
//       setNotice(`Linked ${repo.fullName}.`);
//     } catch (err) {
//       setError(errorText(err, "Failed to link repository."));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleUnlink = async () => {
//     setError("");
//     setNotice("");
//     try {
//       await unlinkRepo(projectId);
//       setLink(null);
//       setNotice("Repository unlinked.");
//     } catch (err) {
//       setError(errorText(err, "Failed to unlink repository."));
//     }
//   };

//   // ---- merge ----
//   const openMerge = (pr) => { setMergeTarget(pr); setMergeMethod("merge"); setMergeError(""); };
//   const closeMerge = () => { if (!merging) setMergeTarget(null); };

//   const confirmMerge = async () => {
//     if (!mergeTarget) return;
//     setMerging(true);
//     setMergeError("");
//     try {
//       await mergePullRequest(projectId, mergeTarget.number, { method: mergeMethod, sha: mergeTarget.headSha });
//       setNotice(`Pull request #${mergeTarget.number} merged.`);
//       setMergeTarget(null);
//       setReloadKey((k) => k + 1);
//     } catch (err) {
//       setMergeError(errorText(err, "Merge failed. Please try again."));
//     } finally {
//       setMerging(false);
//     }
//   };

//   // ---- new issue ----
//   const openIssueForm = async () => {
//     setIssueForm({ title: "", body: "", labels: [] });
//     setIssueError("");
//     setIssueOpen(true);
//     try {
//       const d = await getRepoActivity(projectId, "labels");
//       setRepoLabels(Array.isArray(d) ? d : []);
//     } catch {
//       setRepoLabels([]);
//     }
//   };

//   const toggleLabel = (name) =>
//     setIssueForm((f) => ({
//       ...f,
//       labels: f.labels.includes(name) ? f.labels.filter((l) => l !== name) : [...f.labels, name],
//     }));

//   const submitIssue = async (e) => {
//     e.preventDefault();
//     if (!issueForm.title.trim()) { setIssueError("A title is required."); return; }
//     setIssueSaving(true);
//     setIssueError("");
//     try {
//       const res = await createIssue(projectId, issueForm);
//       setNotice(res?.message || "Issue created.");
//       setIssueOpen(false);
//       setTab("issues");
//       setLabelFilter("");
//       setReloadKey((k) => k + 1);
//     } catch (err) {
//       setIssueError(errorText(err, "Failed to create the issue."));
//     } finally {
//       setIssueSaving(false);
//     }
//   };

//   const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";
//   const issueLabels = tab === "issues"
//     ? Array.from(new Set(rows.flatMap((r) => r.labels || []))).sort()
//     : [];
//   const visibleRows = tab === "issues" && labelFilter
//     ? rows.filter((r) => (r.labels || []).includes(labelFilter))
//     : rows;

//   const renderRow = (r) => (
//     <div className="nf-gh-row" key={r.sha ?? r.number}>
//       <span className="nf-gh-sha">{tab === "commits" ? r.sha : `#${r.number}`}</span>
//       <span className="nf-gh-row-title">{r.message || r.title}</span>
//       {tab === "issues" && (r.labels || []).slice(0, 3).map((l) => (
//         <span className="nf-badge" key={l}>{l}</span>
//       ))}
//       {tab !== "commits" && r.state && (
//         <span className={`nf-badge nf-gh-state-${r.state}`}>{r.state}</span>
//       )}
//       {tab === "pulls" && r.draft && <span className="nf-badge">draft</span>}
//       <span className="nf-gh-row-meta">{r.author || "unknown"} · {timeAgo(r.date)}</span>
//       {tab === "pulls" && r.state === "open" && !r.draft && status.connected && (
//         <button className="nf-gh-merge-btn" onClick={() => openMerge(r)}>
//           <GitMerge size={13} /> Merge
//         </button>
//       )}
//       {safeHref(r.url) && (
//         <a className="nf-gh-open" href={safeHref(r.url)} target="_blank" rel="noreferrer" aria-label="Open on GitHub">
//           <ExternalLink size={14} />
//         </a>
//       )}
//     </div>
//   );

//   return (
//     <>
//       <div className="nf-panel" style={{ marginTop: 16 }}>
//         <div className="nf-gh-header">
//           <div className="nf-gh-title"><GitBranch size={18} /> GitHub</div>
//           <div className="nf-gh-header-right">
//             {link && <span className="nf-gh-repo">{link.repoOwner}/{link.repoName}</span>}
//             {link && (
//               <>
//                 <button className="nf-gh-nav-btn" onClick={() => navigate(`/projects/${projectId}/code`)}>
//                   <Code size={13} /> Browse code
//                 </button>
//                 <button className="nf-gh-nav-btn" onClick={() => navigate(`/projects/${projectId}/settings`)}>
//                   <Settings size={13} /> Settings
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         {notice && <div className="nf-gh-notice">{notice}</div>}
//         {error && <div className="nf-form-error">{error}</div>}

//         {loading ? (
//           <div className="nf-empty-state">Loading GitHub integration...</div>
//         ) : link && !picking ? (
//           <>
//             <div className="nf-gh-meta">
//               <span>Linked by {link.linkedBy ?? "unknown"}</span>
//               {link.canManage && (
//                 <>
//                   <button className="nf-link-btn" onClick={() => setPicking(true)}>Change</button>
//                   <button className="nf-link-btn danger" onClick={handleUnlink}>Unlink</button>
//                 </>
//               )}
//             </div>

//             <div className="nf-gh-tabs">
//               {TABS.map((t) => (
//                 <button
//                   key={t.key}
//                   className={`nf-gh-tab ${tab === t.key ? "active" : ""}`}
//                   onClick={() => { setTab(t.key); setLabelFilter(""); }}
//                 >
//                   {t.label}
//                 </button>
//               ))}
//             </div>

//             {tab === "issues" && (
//               <div className="nf-gh-toolbar">
//                 <select
//                   className="nf-select-filter"
//                   value={labelFilter}
//                   onChange={(e) => setLabelFilter(e.target.value)}
//                 >
//                   <option value="">All labels</option>
//                   {issueLabels.map((l) => <option key={l} value={l}>{l}</option>)}
//                 </select>
//                 {status.connected && (
//                   <button className="nf-btn nf-github-connect-btn" onClick={openIssueForm}>
//                     <Plus size={14} /> New issue
//                   </button>
//                 )}
//               </div>
//             )}

//             <div className="nf-gh-list">
//               {rowsLoading ? (
//                 <div className="nf-empty-state">Loading...</div>
//               ) : rowsError ? (
//                 <div className="nf-form-error" style={{ margin: 12 }}>{rowsError}</div>
//               ) : visibleRows.length === 0 ? (
//                 <div className="nf-empty-state">No {tabLabel.toLowerCase()} found.</div>
//               ) : (
//                 visibleRows.map(renderRow)
//               )}
//             </div>

//             {teamActivity.length > 0 && (
//               <div style={{ marginTop: 16 }}>
//                 <h3 style={{ fontSize: 13, marginBottom: 8 }}>Team Activity</h3>
//                 {teamActivity.map((t) => (
//                   <div key={t.githubUsername} className="nf-gh-row">
//                     <span className="nf-gh-row-title">
//                       {t.name} <span style={{ color: "var(--nf-text-faint)" }}>(@{t.githubUsername})</span>
//                     </span>
//                     <span className="nf-gh-row-meta">
//                       {t.lastCommitAt ? `Last commit ${timeAgo(t.lastCommitAt)}` : "Never committed"}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </>
//         ) : !status.connected ? (
//           <div>
//             <p className="nf-detail-row">
//               Connect your own GitHub account, then choose which of your repositories to link to this project.
//             </p>
//             <button className="nf-btn nf-github-connect-btn" onClick={handleConnect}>
//               <GitBranch size={16} /> Connect GitHub Account
//             </button>
//           </div>
//         ) : (
//           <div>
//             {suggestedRepo && (
//               <div className="nf-gh-suggestion">
//                 <span>Suggested match: <b>{suggestedRepo.fullName}</b></span>
//                 <button type="button" className="nf-btn secondary" onClick={() => setSelected(suggestedRepo.fullName)}>
//                   Use this
//                 </button>
//               </div>
//             )}
//             <div className="nf-field">
//               <label>Choose a repository (connected as @{status.githubUsername})</label>
//               <select value={selected} onChange={(e) => setSelected(e.target.value)}>
//                 <option value="">{reposLoading ? "Loading repositories..." : "Select a repository"}</option>
//                 {repos.map((r) => (
//                   <option key={r.fullName} value={r.fullName}>
//                     {r.fullName}{r.isPrivate ? " (private)" : ""}
//                   </option>
//                 ))}
//               </select>
//               {!reposLoading && repos.length === 0 && (
//                 <div className="nf-field-error">No repositories found for your GitHub account.</div>
//               )}
//             </div>
//             <div className="nf-actions">
//               <button className="nf-btn" onClick={handleLink} disabled={saving || !selected}>
//                 {saving ? "Linking..." : "Link repository"}
//               </button>
//               {link && (
//                 <button className="nf-btn secondary" onClick={() => setPicking(false)}>Cancel</button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <Modal open={!!mergeTarget} onClose={closeMerge} title="Merge pull request">
//         {mergeTarget && (
//           <>
//             <p className="nf-detail-row">
//               Merge <b>#{mergeTarget.number} {mergeTarget.title}</b> in{" "}
//               <b>{link?.repoOwner}/{link?.repoName}</b>?
//             </p>
//             <p className="nf-detail-row" style={{ color: "var(--nf-text-faint)", fontSize: 12.5 }}>
//               This changes the real GitHub repository and can't be undone from NeuroForge.
//             </p>
//             <div className="nf-field">
//               <label>Merge method</label>
//               <select value={mergeMethod} onChange={(e) => setMergeMethod(e.target.value)} disabled={merging}>
//                 {MERGE_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
//               </select>
//             </div>
//             {mergeError && <div className="nf-form-error">{mergeError}</div>}
//             <div className="nf-actions">
//               <button className="nf-btn" onClick={confirmMerge} disabled={merging}>
//                 {merging ? "Merging..." : "Confirm merge"}
//               </button>
//               <button className="nf-btn secondary" onClick={closeMerge} disabled={merging}>Cancel</button>
//             </div>
//           </>
//         )}
//       </Modal>

//       <Modal open={issueOpen} onClose={() => { if (!issueSaving) setIssueOpen(false); }} title="New issue">
//         <form onSubmit={submitIssue}>
//           <p className="nf-detail-row" style={{ color: "var(--nf-text-faint)", fontSize: 12.5 }}>
//             Creates a real issue in {link?.repoOwner}/{link?.repoName} as @{status.githubUsername}.
//           </p>
//           {issueError && <div className="nf-form-error">{issueError}</div>}

//           <div className="nf-field">
//             <label>Title</label>
//             <input
//               value={issueForm.title}
//               maxLength={256}
//               onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
//               placeholder="Short summary of the issue"
//             />
//           </div>
//           <div className="nf-field">
//             <label>Description</label>
//             <textarea
//               value={issueForm.body}
//               onChange={(e) => setIssueForm({ ...issueForm, body: e.target.value })}
//               placeholder="Steps to reproduce, expected behaviour, links..."
//             />
//           </div>

//           {repoLabels.length > 0 && (
//             <div className="nf-field">
//               <label>Labels</label>
//               <div className="nf-gh-label-picker">
//                 {repoLabels.map((l) => (
//                   <button
//                     type="button"
//                     key={l.name}
//                     className={`nf-gh-label-chip ${issueForm.labels.includes(l.name) ? "active" : ""}`}
//                     onClick={() => toggleLabel(l.name)}
//                   >
//                     {l.name}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           <div className="nf-actions">
//             <button type="submit" className="nf-btn" disabled={issueSaving}>
//               {issueSaving ? "Creating..." : "Create issue"}
//             </button>
//             <button type="button" className="nf-btn secondary" onClick={() => setIssueOpen(false)} disabled={issueSaving}>
//               Cancel
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </>
//   );
// };

// export default GithubRepoPanel;
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { GitBranch, ExternalLink, GitMerge, Plus, Code, Settings } from "lucide-react";
import Modal from "./Modal";
import PullRequestDetailsModal from "./PullRequestDetailsModal";
import {
  connectGithub, getGithubStatus, getMyRepos, getRepoLink, linkRepo, unlinkRepo,
  getRepoActivity, getTeamActivity, mergePullRequest, createIssue, setIssueState,
} from "../services/githubService";

const TABS = [
  { key: "pulls", label: "Pull Requests" },
  { key: "issues", label: "Issues" },
  { key: "commits", label: "Commits" },
];

const MERGE_METHODS = [
  { value: "merge", label: "Create a merge commit" },
  { value: "squash", label: "Squash and merge" },
  { value: "rebase", label: "Rebase and merge" },
];

const timeAgo = (iso) => {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diff)) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const safeHref = (url) => (typeof url === "string" && url.startsWith("https://") ? url : undefined);
const errorText = (err, fallback) => err?.response?.data?.message || fallback;

// "Atlas Auth Service" and "atlas-auth-service" compare as equal
const normalize = (s) => (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

const findBestMatch = (projectName, repos) => {
  const target = normalize(projectName);
  if (!target) return null;
  let match = repos.find((r) => normalize(r.name) === target);
  if (match) return match;
  match = repos.find((r) => {
    const n = normalize(r.name);
    return n && (n.includes(target) || target.includes(n));
  });
  return match || null;
};

const GithubRepoPanel = ({ projectId, projectName }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState({ connected: false, githubUsername: null });
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [picking, setPicking] = useState(false);
  const [repos, setRepos] = useState([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [suggestedRepo, setSuggestedRepo] = useState(null);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState("commits");
  const [rows, setRows] = useState([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [rowsError, setRowsError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [labelFilter, setLabelFilter] = useState("");

  const [teamActivity, setTeamActivity] = useState([]);

  const [mergeTarget, setMergeTarget] = useState(null);
  const [mergeMethod, setMergeMethod] = useState("merge");
  const [merging, setMerging] = useState(false);
  const [mergeError, setMergeError] = useState("");

  const [detailsPr, setDetailsPr] = useState(null);
  const [issueBusy, setIssueBusy] = useState(null);

  const [issueOpen, setIssueOpen] = useState(false);
  const [repoLabels, setRepoLabels] = useState([]);
  const [issueForm, setIssueForm] = useState({ title: "", body: "", labels: [] });
  const [issueSaving, setIssueSaving] = useState(false);
  const [issueError, setIssueError] = useState("");

  const showPicker = !loading && status.connected && (!link || picking);

  // Initial load: my GitHub connection + this project's linked repository
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([getGithubStatus(), getRepoLink(projectId)]).then(([s, l]) => {
      if (cancelled) return;
      if (s.status === "fulfilled" && s.value) setStatus(s.value);
      setLink(l.status === "fulfilled" && l.value ? l.value : null);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [projectId]);

  // Message after returning from GitHub
  useEffect(() => {
    const result = searchParams.get("github");
    if (result === "connected") setNotice("GitHub account connected.");
    if (result === "error") setError("GitHub connection failed. Please try again.");
  }, [searchParams]);

  // Repositories for the dropdown (only while the picker is visible), with auto-match
  useEffect(() => {
    if (!showPicker) return undefined;
    let cancelled = false;
    setReposLoading(true);
    getMyRepos()
      .then((d) => {
        if (cancelled) return;
        const list = Array.isArray(d) ? d : [];
        setRepos(list);
        const match = findBestMatch(projectName, list);
        setSuggestedRepo(match);
        if (match) setSelected((prev) => prev || match.fullName);
      })
      .catch((err) => { if (!cancelled) setError(errorText(err, "Could not load your GitHub repositories.")); })
      .finally(() => { if (!cancelled) setReposLoading(false); });
    return () => { cancelled = true; };
  }, [showPicker, projectName]);

  // Pull requests / issues / commits of the linked repository
  useEffect(() => {
    if (!link) { setRows([]); return undefined; }
    let cancelled = false;
    setRowsLoading(true);
    setRowsError("");
    getRepoActivity(projectId, tab)
      .then((d) => { if (!cancelled) setRows(Array.isArray(d) ? d : []); })
      .catch((err) => {
        if (!cancelled) { setRows([]); setRowsError(errorText(err, "Could not load GitHub data.")); }
      })
      .finally(() => { if (!cancelled) setRowsLoading(false); });
    return () => { cancelled = true; };
  }, [link, tab, projectId, reloadKey]);

  // Last commit per connected teammate
  useEffect(() => {
    if (!link) { setTeamActivity([]); return undefined; }
    let cancelled = false;
    getTeamActivity(projectId)
      .then((d) => { if (!cancelled) setTeamActivity(Array.isArray(d) ? d : []); })
      .catch(() => { if (!cancelled) setTeamActivity([]); });
    return () => { cancelled = true; };
  }, [link, projectId]);

  const handleConnect = async () => {
    setError("");
    try {
      await connectGithub(window.location.pathname);
    } catch {
      setError("Could not start the GitHub connection. Please try again.");
    }
  };

  const handleLink = async () => {
    const repo = repos.find((r) => r.fullName === selected);
    if (!repo) { setError("Select a repository first."); return; }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const saved = await linkRepo(projectId, { repoOwner: repo.owner, repoName: repo.name });
      setLink(saved);
      setPicking(false);
      setSelected("");
      setNotice(`Linked ${repo.fullName}.`);
    } catch (err) {
      setError(errorText(err, "Failed to link repository."));
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async () => {
    setError("");
    setNotice("");
    try {
      await unlinkRepo(projectId);
      setLink(null);
      setNotice("Repository unlinked.");
    } catch (err) {
      setError(errorText(err, "Failed to unlink repository."));
    }
  };

  // ---- merge ----
  const openMerge = (pr) => { setMergeTarget(pr); setMergeMethod("merge"); setMergeError(""); };
  const closeMerge = () => { if (!merging) setMergeTarget(null); };

  const confirmMerge = async () => {
    if (!mergeTarget) return;
    setMerging(true);
    setMergeError("");
    try {
      await mergePullRequest(projectId, mergeTarget.number, { method: mergeMethod, sha: mergeTarget.headSha });
      setNotice(`Pull request #${mergeTarget.number} merged.`);
      setMergeTarget(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setMergeError(errorText(err, "Merge failed. Please try again."));
    } finally {
      setMerging(false);
    }
  };

  // ---- close / reopen issue ----
  const toggleIssue = async (issue) => {
    const next = issue.state === "open" ? "closed" : "open";
    setIssueBusy(issue.number);
    setError("");
    setNotice("");
    try {
      const res = await setIssueState(projectId, issue.number, next);
      setNotice(res?.message || `Issue #${issue.number} updated.`);
      setReloadKey((k) => k + 1);
    } catch (err) {
      setError(errorText(err, "Could not update the issue."));
    } finally {
      setIssueBusy(null);
    }
  };

  // ---- new issue ----
  const openIssueForm = async () => {
    setIssueForm({ title: "", body: "", labels: [] });
    setIssueError("");
    setIssueOpen(true);
    try {
      const d = await getRepoActivity(projectId, "labels");
      setRepoLabels(Array.isArray(d) ? d : []);
    } catch {
      setRepoLabels([]);
    }
  };

  const toggleLabel = (name) =>
    setIssueForm((f) => ({
      ...f,
      labels: f.labels.includes(name) ? f.labels.filter((l) => l !== name) : [...f.labels, name],
    }));

  const submitIssue = async (e) => {
    e.preventDefault();
    if (!issueForm.title.trim()) { setIssueError("A title is required."); return; }
    setIssueSaving(true);
    setIssueError("");
    try {
      const res = await createIssue(projectId, issueForm);
      setNotice(res?.message || "Issue created.");
      setIssueOpen(false);
      setTab("issues");
      setLabelFilter("");
      setReloadKey((k) => k + 1);
    } catch (err) {
      setIssueError(errorText(err, "Failed to create the issue."));
    } finally {
      setIssueSaving(false);
    }
  };

  const tabLabel = TABS.find((t) => t.key === tab)?.label ?? "";
  const issueLabels = tab === "issues"
    ? Array.from(new Set(rows.flatMap((r) => r.labels || []))).sort()
    : [];
  const visibleRows = tab === "issues" && labelFilter
    ? rows.filter((r) => (r.labels || []).includes(labelFilter))
    : rows;

  const renderRow = (r) => (
    <div className="nf-gh-row" key={r.sha ?? r.number}>
      <span className="nf-gh-sha">{tab === "commits" ? r.sha : `#${r.number}`}</span>
      <span className="nf-gh-row-title">{r.message || r.title}</span>
      {tab === "issues" && (r.labels || []).slice(0, 3).map((l) => (
        <span className="nf-badge" key={l}>{l}</span>
      ))}
      {tab !== "commits" && r.state && (
        <span className={`nf-badge nf-gh-state-${r.state}`}>{r.state}</span>
      )}
      {tab === "pulls" && r.draft && <span className="nf-badge">draft</span>}
      <span className="nf-gh-row-meta">{r.author || "unknown"} · {timeAgo(r.date)}</span>

      {tab === "pulls" && (
        <button className="nf-gh-action-btn" onClick={() => setDetailsPr(r)}>Files</button>
      )}
      {tab === "pulls" && r.state === "open" && !r.draft && status.connected && (
        <button className="nf-gh-merge-btn" onClick={() => openMerge(r)}>
          <GitMerge size={13} /> Merge
        </button>
      )}
      {tab === "issues" && status.connected && (
        <button
          className="nf-gh-action-btn"
          disabled={issueBusy === r.number}
          onClick={() => toggleIssue(r)}
        >
          {issueBusy === r.number ? "..." : r.state === "open" ? "Close" : "Reopen"}
        </button>
      )}
      {safeHref(r.url) && (
        <a className="nf-gh-open" href={safeHref(r.url)} target="_blank" rel="noreferrer" aria-label="Open on GitHub">
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );

  return (
    <>
      <div className="nf-panel" style={{ marginTop: 16 }}>
        <div className="nf-gh-header">
          <div className="nf-gh-title"><GitBranch size={18} /> GitHub</div>
          <div className="nf-gh-header-right">
            {link && <span className="nf-gh-repo">{link.repoOwner}/{link.repoName}</span>}
            {link && (
              <>
                <button className="nf-gh-nav-btn" onClick={() => navigate(`/projects/${projectId}/code`)}>
                  <Code size={13} /> Browse code
                </button>
                <button className="nf-gh-nav-btn" onClick={() => navigate(`/projects/${projectId}/settings`)}>
                  <Settings size={13} /> Settings
                </button>
              </>
            )}
          </div>
        </div>

        {notice && <div className="nf-gh-notice">{notice}</div>}
        {error && <div className="nf-form-error">{error}</div>}

        {loading ? (
          <div className="nf-empty-state">Loading GitHub integration...</div>
        ) : link && !picking ? (
          <>
            <div className="nf-gh-meta">
              <span>Linked by {link.linkedBy ?? "unknown"}</span>
              {link.canManage && (
                <>
                  <button className="nf-link-btn" onClick={() => setPicking(true)}>Change</button>
                  <button className="nf-link-btn danger" onClick={handleUnlink}>Unlink</button>
                </>
              )}
            </div>

            <div className="nf-gh-tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`nf-gh-tab ${tab === t.key ? "active" : ""}`}
                  onClick={() => { setTab(t.key); setLabelFilter(""); }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "issues" && (
              <div className="nf-gh-toolbar">
                <select
                  className="nf-select-filter"
                  value={labelFilter}
                  onChange={(e) => setLabelFilter(e.target.value)}
                >
                  <option value="">All labels</option>
                  {issueLabels.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                {status.connected && (
                  <button className="nf-btn nf-github-connect-btn" onClick={openIssueForm}>
                    <Plus size={14} /> New issue
                  </button>
                )}
              </div>
            )}

            <div className="nf-gh-list">
              {rowsLoading ? (
                <div className="nf-empty-state">Loading...</div>
              ) : rowsError ? (
                <div className="nf-empty-state" style={{ color: "var(--nf-text-faint)", fontSize: 12 }}>
                  No {tabLabel.toLowerCase()} data available for this repository.
                </div>
              ) : visibleRows.length === 0 ? (
                <div className="nf-empty-state">No {tabLabel.toLowerCase()} found.</div>
              ) : (
                visibleRows.map(renderRow)
              )}
            </div>

            {teamActivity.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 13, marginBottom: 8 }}>Team Activity</h3>
                {teamActivity.map((t) => (
                  <div key={t.githubUsername} className="nf-gh-row">
                    <span className="nf-gh-row-title">
                      {t.name} <span style={{ color: "var(--nf-text-faint)" }}>(@{t.githubUsername})</span>
                    </span>
                    <span className="nf-gh-row-meta">
                      {t.lastCommitAt ? `Last commit ${timeAgo(t.lastCommitAt)}` : "Never committed"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : !status.connected ? (
          <div>
            <p className="nf-detail-row">
              Connect your own GitHub account, then choose which of your repositories to link to this project.
            </p>
            <button className="nf-btn nf-github-connect-btn" onClick={handleConnect}>
              <GitBranch size={16} /> Connect GitHub Account
            </button>
          </div>
        ) : (
          <div>
            {suggestedRepo && (
              <div className="nf-gh-suggestion">
                <span>Suggested match: <b>{suggestedRepo.fullName}</b></span>
                <button type="button" className="nf-btn secondary" onClick={() => setSelected(suggestedRepo.fullName)}>
                  Use this
                </button>
              </div>
            )}
            <div className="nf-field">
              <label>Choose a repository (connected as @{status.githubUsername})</label>
              <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">{reposLoading ? "Loading repositories..." : "Select a repository"}</option>
                {repos.map((r) => (
                  <option key={r.fullName} value={r.fullName}>
                    {r.fullName}{r.isPrivate ? " (private)" : ""}
                  </option>
                ))}
              </select>
              {!reposLoading && repos.length === 0 && (
                <div className="nf-field-error">No repositories found for your GitHub account.</div>
              )}
            </div>
            <div className="nf-actions">
              <button className="nf-btn" onClick={handleLink} disabled={saving || !selected}>
                {saving ? "Linking..." : "Link repository"}
              </button>
              {link && (
                <button className="nf-btn secondary" onClick={() => setPicking(false)}>Cancel</button>
              )}
            </div>
          </div>
        )}
      </div>

      <PullRequestDetailsModal projectId={projectId} pr={detailsPr} onClose={() => setDetailsPr(null)} />

      <Modal open={!!mergeTarget} onClose={closeMerge} title="Merge pull request">
        {mergeTarget && (
          <>
            <p className="nf-detail-row">
              Merge <b>#{mergeTarget.number} {mergeTarget.title}</b> in{" "}
              <b>{link?.repoOwner}/{link?.repoName}</b>?
            </p>
            <p className="nf-detail-row" style={{ color: "var(--nf-text-faint)", fontSize: 12.5 }}>
              This changes the real GitHub repository and can't be undone from NeuroForge.
            </p>
            <div className="nf-field">
              <label>Merge method</label>
              <select value={mergeMethod} onChange={(e) => setMergeMethod(e.target.value)} disabled={merging}>
                {MERGE_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            {mergeError && <div className="nf-form-error">{mergeError}</div>}
            <div className="nf-actions">
              <button className="nf-btn" onClick={confirmMerge} disabled={merging}>
                {merging ? "Merging..." : "Confirm merge"}
              </button>
              <button className="nf-btn secondary" onClick={closeMerge} disabled={merging}>Cancel</button>
            </div>
          </>
        )}
      </Modal>

      <Modal open={issueOpen} onClose={() => { if (!issueSaving) setIssueOpen(false); }} title="New issue">
        <form onSubmit={submitIssue}>
          <p className="nf-detail-row" style={{ color: "var(--nf-text-faint)", fontSize: 12.5 }}>
            Creates a real issue in {link?.repoOwner}/{link?.repoName} as @{status.githubUsername}.
          </p>
          {issueError && <div className="nf-form-error">{issueError}</div>}

          <div className="nf-field">
            <label>Title</label>
            <input
              value={issueForm.title}
              maxLength={256}
              onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
              placeholder="Short summary of the issue"
            />
          </div>
          <div className="nf-field">
            <label>Description</label>
            <textarea
              value={issueForm.body}
              onChange={(e) => setIssueForm({ ...issueForm, body: e.target.value })}
              placeholder="Steps to reproduce, expected behaviour, links..."
            />
          </div>

          {repoLabels.length > 0 && (
            <div className="nf-field">
              <label>Labels</label>
              <div className="nf-gh-label-picker">
                {repoLabels.map((l) => (
                  <button
                    type="button"
                    key={l.name}
                    className={`nf-gh-label-chip ${issueForm.labels.includes(l.name) ? "active" : ""}`}
                    onClick={() => toggleLabel(l.name)}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="nf-actions">
            <button type="submit" className="nf-btn" disabled={issueSaving}>
              {issueSaving ? "Creating..." : "Create issue"}
            </button>
            <button type="button" className="nf-btn secondary" onClick={() => setIssueOpen(false)} disabled={issueSaving}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default GithubRepoPanel;
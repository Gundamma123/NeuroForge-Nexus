// import api from "./api";

// // Starts the GitHub OAuth flow. The backend returns a one-time GitHub URL,
// // so the login token is never sent to GitHub.
// export const connectGithub = async (returnTo) => {
//   const path = typeof returnTo === "string" ? returnTo : window.location.pathname;
//   const { data } = await api.get("/github/connect-url", { params: { returnTo: path } });
//   if (!data?.url) throw new Error("No GitHub authorization URL returned.");
//   window.location.href = data.url;
// };

// export const getGithubStatus = async () => {
//   const { data } = await api.get("/github/status");
//   return data;
// };

// export const disconnectGithub = async () => {
//   await api.delete("/github/disconnect");
// };

// export const getMyRepos = async () => {
//   const { data } = await api.get("/github/repos");
//   return data;
// };

// export const getRepoLink = async (projectId) => {
//   const { data } = await api.get(`/github/projects/${projectId}/repo`);
//   return data || null; // 204 (no link) arrives as an empty string
// };

// export const linkRepo = async (projectId, payload) => {
//   const { data } = await api.post(`/github/projects/${projectId}/repo`, payload);
//   return data;
// };

// export const unlinkRepo = async (projectId) => {
//   await api.delete(`/github/projects/${projectId}/repo`);
// };

// export const getRepoActivity = async (projectId, section) => {
//   const { data } = await api.get(`/github/projects/${projectId}/activity/${section}`);
//   return data;
// };

// export const getTeamActivity = async (projectId) => {
//   const { data } = await api.get(`/github/projects/${projectId}/team-activity`);
//   return data;
// };

// export const mergePullRequest = async (projectId, number, payload) => {
//   const { data } = await api.post(`/github/projects/${projectId}/pulls/${number}/merge`, payload);
//   return data;
// };

// export const createIssue = async (projectId, payload) => {
//   const { data } = await api.post(`/github/projects/${projectId}/issues`, payload);
//   return data;
// };

// export const getBranches = async (projectId) => {
//   const { data } = await api.get(`/github/projects/${projectId}/browse/branches`);
//   return data;
// };

// export const getTree = async (projectId, ref, path) => {
//   const { data } = await api.get(`/github/projects/${projectId}/browse/tree`, { params: { ref, path } });
//   return data;
// };

// export const getFile = async (projectId, ref, path) => {
//   const { data } = await api.get(`/github/projects/${projectId}/browse/file`, { params: { ref, path } });
//   return data;
// };

// export const getReadme = async (projectId, ref) => {
//   const { data } = await api.get(`/github/projects/${projectId}/browse/readme`, { params: { ref } });
//   return data;
// };

// export const getRepoSettings = async (projectId) => {
//   const { data } = await api.get(`/github/projects/${projectId}/settings`);
//   return data;
// };

// export const setRepoSync = async (projectId, active) => {
//   const { data } = await api.patch(`/github/projects/${projectId}/sync`, { active });
//   return data;
// };

// const githubService = {
//   connectGithub,
//   getGithubStatus,
//   disconnectGithub,
//   getMyRepos,
//   getRepoLink,
//   linkRepo,
//   unlinkRepo,
//   getRepoActivity,
//   getTeamActivity,
//   mergePullRequest,
//   createIssue,
//   getBranches,
//   getTree,
//   getFile,
//   getReadme,
//   getRepoSettings,
//   setRepoSync,
// };

// export default githubService;

import api from "./api";

// Starts the GitHub OAuth flow.
// The backend endpoint GET /auth/github?token=<JWT> is a redirect — not JSON.
// We navigate the browser directly to it so GitHub can redirect back via callback.
export const connectGithub = () => {
  const token = localStorage.getItem("nf_token");
  if (!token) throw new Error("Not authenticated.");
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
  window.location.href = `${base}/auth/github?token=${encodeURIComponent(token)}`;
};

export const getGithubStatus = async () => {
  const { data } = await api.get("/github/status");
  return data;
};

export const disconnectGithub = async () => {
  await api.delete("/github/disconnect");
};

export const getMyRepos = async () => {
  const { data } = await api.get("/github/repos");
  return data;
  
};

export const getRepoLink = async (projectId) => {
  const { data } = await api.get(`/github/projects/${projectId}/repo`);
  return data || null; // 204 (no link) arrives as an empty string
};

export const linkRepo = async (projectId, payload) => {
  const { data } = await api.post(`/github/projects/${projectId}/repo`, payload);
  return data;
};

export const unlinkRepo = async (projectId) => {
  await api.delete(`/github/projects/${projectId}/repo`);
};

export const getRepoActivity = async (projectId, section) => {
  const { data } = await api.get(`/github/projects/${projectId}/activity/${section}`);
  return data;
};

export const getTeamActivity = async (projectId) => {
  const { data } = await api.get(`/github/projects/${projectId}/team-activity`);
  return data;
};

export const mergePullRequest = async (projectId, number, payload) => {
  const { data } = await api.post(`/github/projects/${projectId}/pulls/${number}/merge`, payload);
  return data;
};

export const getPullDetails = async (projectId, number) => {
  const { data } = await api.get(`/github/projects/${projectId}/pulls/${number}/details`);
  return data;
};

export const createIssue = async (projectId, payload) => {
  const { data } = await api.post(`/github/projects/${projectId}/issues`, payload);
  return data;
};

export const setIssueState = async (projectId, number, state) => {
  const { data } = await api.patch(`/github/projects/${projectId}/issues/${number}/state`, { state });
  return data;
};

export const rerunWorkflowRun = async (projectId, runId) => {
  const { data } = await api.post(`/github/projects/${projectId}/runs/${runId}/rerun`);
  return data;
};

export const getBranches = async (projectId) => {
  const { data } = await api.get(`/github/projects/${projectId}/browse/branches`);
  return data;
};

export const getTree = async (projectId, ref, path) => {
  const { data } = await api.get(`/github/projects/${projectId}/browse/tree`, { params: { ref, path } });
  return data;
};

export const getFile = async (projectId, ref, path) => {
  const { data } = await api.get(`/github/projects/${projectId}/browse/file`, { params: { ref, path } });
  return data;
};

export const getReadme = async (projectId, ref) => {
  const { data } = await api.get(`/github/projects/${projectId}/browse/readme`, { params: { ref } });
  return data;
};

export const getRepoSettings = async (projectId) => {
  const { data } = await api.get(`/github/projects/${projectId}/settings`);
  return data;
};

export const setRepoSync = async (projectId, active) => {
  const { data } = await api.patch(`/github/projects/${projectId}/sync`, { active });
  return data;
};

const githubService = {
  connectGithub,
  getGithubStatus,
  disconnectGithub,
  getMyRepos,
  getRepoLink,
  linkRepo,
  unlinkRepo,
  getRepoActivity,
  getTeamActivity,
  mergePullRequest,
  getPullDetails,
  createIssue,
  setIssueState,
  rerunWorkflowRun,
  getBranches,
  getTree,
  getFile,
  getReadme,
  getRepoSettings,
  setRepoSync,
};

export default githubService;
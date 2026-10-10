import api from "./api";

export const getBugs = async ({ status, severity, projectId } = {}) => {
  const params = {};
  if (status) params.status = status;
  if (severity) params.severity = severity;
  if (projectId) params.projectId = projectId;
  const { data } = await api.get("/bugs", { params });
  return data;
};

export const getBugStats = async () => {
  const { data } = await api.get("/bugs/stats");
  return data;
};

export const getBugAssignees = async () => {
  const { data } = await api.get("/bugs/assignees");
  return data;
};

export const getBug = async (id) => {
  const { data } = await api.get(`/bugs/${id}`);
  return data;
};

export const createBug = async (payload) => {
  const { data } = await api.post("/bugs", payload);
  return data;
};

export const updateBug = async (id, payload) => {
  const { data } = await api.put(`/bugs/${id}`, payload);
  return data;
};

export const deleteBug = async (id) => {
  await api.delete(`/bugs/${id}`);
};

const bugService = { getBugs, getBugStats, getBugAssignees, getBug, createBug, updateBug, deleteBug };

export default bugService;
import api from "./api";

// --- Project Service endpoints (Milestone 1: Project & User Management) ---

export const getAllProjects = async () => {
  const { data } = await api.get("/projects");
  return data;
};

export const getProjectById = async (id) => {
  const { data } = await api.get(`/projects/${id}`);
  return data;
};

export const createProject = async (payload) => {
  const { data } = await api.post("/projects", payload);
  return data;
};

export const updateProject = async (id, payload) => {
  const { data } = await api.put(`/projects/${id}`, payload);
  return data;
};

export const deleteProject = async (id) => {
  await api.delete(`/projects/${id}`);
};

const projectService = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

export default projectService;
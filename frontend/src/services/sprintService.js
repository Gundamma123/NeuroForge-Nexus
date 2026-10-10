// import api from "./api";

// // --- Sprint Service endpoints (Milestone 1: Sprint Planning) ---

// export const getAllSprints = async () => {
//   const { data } = await api.get("/sprints");
//   return data;
// };

// export const getSprintById = async (id) => {
//   const { data } = await api.get(`/sprints/${id}`);
//   return data;
// };

// export const createSprint = async (payload) => {
//   // payload: { name, projectId, taskCount, points, startDate, endDate, status }
//   const { data } = await api.post("/sprints", payload);
//   return data;
// };

// export const updateSprint = async (id, payload) => {
//   const { data } = await api.put(`/sprints/${id}`, payload);
//   return data;
// };

// export const deleteSprint = async (id) => {
//   await api.delete(`/sprints/${id}`);
// };

// const sprintService = {
//   getAllSprints,
//   getSprintById,
//   createSprint,
//   updateSprint,
//   deleteSprint,
// };

// export default sprintService;/
import api from "./api";

// Get all sprints
export const getAllSprints = async () => {
  const { data } = await api.get("/sprints");
  return data;
};

// Get one sprint by ID
export const getSprintById = async (id) => {
  const { data } = await api.get(`/sprints/${id}`);
  return data;
};

// Get sprints belonging to a specific project
export const getSprintsByProject = async (projectId) => {
  const { data } = await api.get(`/sprints/project/${projectId}`);
  return data;
};

// Create sprint
export const createSprint = async (payload) => {
  const { data } = await api.post("/sprints", payload);
  return data;
};

// Update sprint
export const updateSprint = async (id, payload) => {
  const { data } = await api.put(`/sprints/${id}`, payload);
  return data;
};

// Delete sprint
export const deleteSprint = async (id) => {
  await api.delete(`/sprints/${id}`);
};

// Default service object
const sprintService = {
  getAllSprints,
  getSprintById,
  getSprintsByProject,
  createSprint,
  updateSprint,
  deleteSprint,
};

export default sprintService;
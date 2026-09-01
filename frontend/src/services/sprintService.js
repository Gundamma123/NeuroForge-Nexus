import api from "./api";

// --- Sprint Service endpoints (Milestone 1: Sprint Planning) ---

export const getAllSprints = async () => {
  const { data } = await api.get("/sprints");
  return data;
};

export const getSprintById = async (id) => {
  const { data } = await api.get(`/sprints/${id}`);
  return data;
};

export const createSprint = async (payload) => {
  // payload: { name, projectId, taskCount, points, startDate, endDate, status }
  const { data } = await api.post("/sprints", payload);
  return data;
};

export const updateSprint = async (id, payload) => {
  const { data } = await api.put(`/sprints/${id}`, payload);
  return data;
};

export const deleteSprint = async (id) => {
  await api.delete(`/sprints/${id}`);
};

const sprintService = {
  getAllSprints,
  getSprintById,
  createSprint,
  updateSprint,
  deleteSprint,
};

export default sprintService;
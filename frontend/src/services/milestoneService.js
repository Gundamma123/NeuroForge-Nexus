import api from "./api";

// --- Milestone Service endpoints (Milestone 1: Milestone Tracking) ---

export const getAllMilestones = async () => {
  const { data } = await api.get("/milestones");
  return data;
};

export const getMilestoneById = async (id) => {
  const { data } = await api.get(`/milestones/${id}`);
  return data;
};

export const createMilestone = async (payload) => {
  // payload: { name, projectId, dueDate, status }
  const { data } = await api.post("/milestones", payload);
  return data;
};

export const updateMilestone = async (id, payload) => {
  const { data } = await api.put(`/milestones/${id}`, payload);
  return data;
};

export const deleteMilestone = async (id) => {
  await api.delete(`/milestones/${id}`);
};

const milestoneService = {
  getAllMilestones,
  getMilestoneById,
  createMilestone,
  updateMilestone,
  deleteMilestone,
};

export default milestoneService;
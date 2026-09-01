import api from "./api";

// --- Team Service endpoints (Milestone 1: Team Management) ---

export const getAllTeams = async () => {
  const { data } = await api.get("/teams");
  return data;
};

export const getTeamById = async (id) => {
  const { data } = await api.get(`/teams/${id}`);
  return data;
};

export const createTeam = async (payload) => {
  // payload: { name, projectId, memberCount }
  const { data } = await api.post("/teams", payload);
  return data;
};

export const updateTeam = async (id, payload) => {
  const { data } = await api.put(`/teams/${id}`, payload);
  return data;
};

export const deleteTeam = async (id) => {
  await api.delete(`/teams/${id}`);
};

const teamService = {
  getAllTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
};

export default teamService;
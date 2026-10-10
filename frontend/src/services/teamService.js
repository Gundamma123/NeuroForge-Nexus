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

export const getTeamsByProject = async (projectId) => {
  const { data } = await api.get(`/teams/project/${projectId}`);
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

export const getAssignedMemberIds = async (excludeTeamId) => {
  const params = excludeTeamId ? { excludeTeamId } : {};
  const { data } = await api.get("/teams/assigned-members", { params });
  return data;
};

// Remove a member from a team
export const removeMemberFromTeam = async (teamId, memberId) => {
  const { data } = await api.delete(
    `/teams/${teamId}/members/${memberId}`
  );
  return data;
};

// Default service object
const teamService = {
  getAllTeams,
  getTeamById,
  getTeamsByProject,
  getAssignedMemberIds,
  createTeam,
  updateTeam,
  deleteTeam,
  removeMemberFromTeam,
};

export default teamService;
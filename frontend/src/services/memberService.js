import api from "./api";

// --- Member pool endpoints (Phase 3 backend) ---

export const getAllMembers = async () => {
  const { data } = await api.get("/members");
  return data;
};

export const getMembersByRole = async (role) => {
  const { data } = await api.get(`/members/role/${encodeURIComponent(role)}`);
  return data;
};

export const getMemberById = async (id) => {
  const { data } = await api.get(`/members/${id}`);
  return data;
};

// Admin-only on the backend (@PreAuthorize hasRole ADMIN).
// A non-admin calling this receives a 403 with a clear message —
// the UI should also hide the trigger button for non-admins.
export const createMember = async (payload) => {
  // payload: { name, email, role, experienceYears, skills, availability }
  const { data } = await api.post("/members", payload);
  return data;
};

const memberService = {
  getAllMembers,
  getMembersByRole,
  getMemberById,
  createMember,
};

export default memberService;
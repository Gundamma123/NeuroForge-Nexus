import api from "./api";

// --- User Service endpoints (Milestone 1: Project & User Management) ---

export const login = async (credentials) => {
  // POST /api/auth/login  -> { token, user: { id, name, email, role } }
  const { data } = await api.post("/auth/login", credentials);
  if (data?.token) {
    localStorage.setItem("nf_token", data.token);
    localStorage.setItem("nf_user", JSON.stringify(data.user));
  }
  return data;
};

export const register = async (payload) => {
  // POST /api/auth/register -> { id, name, email, role }
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const logout = () => {
  localStorage.removeItem("nf_token");
  localStorage.removeItem("nf_user");
};

export const getCurrentUser = () => {
  const raw = localStorage.getItem("nf_user");
  return raw ? JSON.parse(raw) : null;
};

export const isAuthenticated = () => !!localStorage.getItem("nf_token");

export const getDashboardSummary = async () => {
  // GET /api/dashboard/summary
  // Expected shape:
  // {
  //   activeProjects: 247, registeredUsers: 2847, activeTeams: 47,
  //   userService: { project, status, teamSize, users, rbacProvider,
  //     roles, teams, sprint: { name, tasks, points },
  //     milestone: { name, dueDate } }
  // }
  const { data } = await api.get("/dashboard/summary");
  return data;
};

export const userService = {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
  getDashboardSummary,
};

export default userService;
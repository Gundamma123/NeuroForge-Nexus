import api from "./api";

export const getAllTasks = async () => {
  const { data } = await api.get("/tasks");
  return data;
};

export const getTasksBySprint = async (sprintId) => {
  const { data } = await api.get(`/tasks/sprint/${sprintId}`);
  return data;
};

export const getTaskById = async (id) => {
  const { data } = await api.get(`/tasks/${id}`);
  return data;
};

export const createTask = async (payload) => {
  const { data } = await api.post("/tasks", payload);
  return data;
};

export const updateTask = async (id, payload) => {
  const { data } = await api.put(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`);
};

const taskService = {
  getAllTasks,
  getTasksBySprint,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};

export default taskService;
import api from "./api";

export const getSubTasksByTask = async (taskId) => {
  const { data } = await api.get(`/subtasks/task/${taskId}`);
  return data;
};

export const getSubTaskById = async (id) => {
  const { data } = await api.get(`/subtasks/${id}`);
  return data;
};

export const createSubTask = async (payload) => {
  const { data } = await api.post("/subtasks", payload);
  return data;
};

export const updateSubTask = async (id, payload) => {
  const { data } = await api.put(`/subtasks/${id}`, payload);
  return data;
};

export const deleteSubTask = async (id) => {
  await api.delete(`/subtasks/${id}`);
};

const subTaskService = {
  getSubTasksByTask,
  getSubTaskById,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};

export default subTaskService;
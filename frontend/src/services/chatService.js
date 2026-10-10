import api from "./api";

export const sendChat = async (messages) => {
  const { data } = await api.post("/chat", { messages }, { timeout: 130000 });
  return data; // { reply: "..." }
};

export default { sendChat };
import axios from "axios";

const api = axios.create({
  baseURL: "https://real-time-chat-backend-28xj.onrender.com/api",
  withCredentials: true,
});

export default api;

import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
};

export const usersAPI = {
  getUsers: () => api.get("/users"),
  getProfile: () => api.get("/users/profile"),
};

export const messagesAPI = {
  getMessages: (receiverId) => api.get(`/messages/${receiverId}`),
  sendMessage: (messageData) => api.post("/messages/send", messageData),
};

export default api;

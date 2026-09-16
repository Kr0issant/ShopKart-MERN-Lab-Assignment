import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/customers";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerCustomer = async (data) => {
  const response = await api.post("/register", data);
  return response.data;
};

export const loginCustomer = async (data) => {
  const response = await api.post("/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post("/logout");
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.patch("/change-password", data);
  return response.data;
};

export default api;

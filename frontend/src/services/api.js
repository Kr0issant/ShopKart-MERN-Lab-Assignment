import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Customer Authentication APIs
export const registerCustomer = async (data) => {
  const response = await api.post("/customers/register", data);
  return response.data;
};

export const loginCustomer = async (data) => {
  const response = await api.post("/customers/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/customers/me");
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post("/customers/logout");
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.patch("/customers/change-password", data);
  return response.data;
};

// Product Discovery APIs
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const addProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

export default api;

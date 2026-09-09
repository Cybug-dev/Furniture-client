import api from "./client.js";

// Supported params: page, limit, category, search, and sort.
// Preserve the response body, including any pagination metadata.
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });

  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${encodeURIComponent(id)}`);

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

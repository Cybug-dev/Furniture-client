import api from "./client.js";

const PRODUCT_CACHE_AGE = 30 * 60 * 1000;

function shuffle(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function reorderProducts(payload) {
  if (Array.isArray(payload?.data)) return { ...payload, data: shuffle(payload.data) };
  if (Array.isArray(payload?.data?.items)) {
    return { ...payload, data: { ...payload.data, items: shuffle(payload.data.items) } };
  }
  return payload;
}

// Supported params: page, limit, category, search, and sort.
// Preserve the response body, including any pagination metadata.
export const getProducts = async (params = {}) => {
  const key = `furniture:products:${JSON.stringify(params)}`;
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached && Date.now() - cached.savedAt < PRODUCT_CACHE_AGE) return cached.payload;
  } catch { /* Storage may be unavailable. */ }

  const response = await api.get("/products", { params });
  const payload = reorderProducts(response.data);
  try { localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), payload })); } catch { /* Use the live response. */ }
  return payload;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${encodeURIComponent(id)}`);

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

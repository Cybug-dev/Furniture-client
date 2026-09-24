import api from '../api/client.js';
import { queryClient } from '../query/queryClient.js';

// Contract: backend feature/checkout-order-lifecycle, src/config/checkout.swagger.js.
// All ownership comes from the HttpOnly session; never send userId or prices.
async function request(method, url, { data, params, signal } = {}) {
  try {
    const response = await api.request({ method, url, data, params, signal, requiresAuth: true });
    return response.data.data;
  } catch (error) {
    if (error.status === 401) queryClient.setQueryData(['auth', 'me'], null);
    throw error; // Already normalized by the shared Axios interceptor.
  }
}
const segment = (id) => encodeURIComponent(id);
export const commerceApi = {
  cart: (signal) => request('get', '/cart', { signal }),
  addItem: (data) => request('post', '/cart/items', { data }),
  updateItem: ({ id, quantity }) => request('patch', `/cart/items/${segment(id)}`, { data: { quantity } }),
  removeItem: (id) => request('delete', `/cart/items/${segment(id)}`),
  clearCart: () => request('delete', '/cart'),
  addresses: (signal) => request('get', '/me/addresses', { signal }),
  saveAddress: ({ id, ...data }) => request(id ? 'patch' : 'post', `/me/addresses${id ? `/${segment(id)}` : ''}`, { data }),
  deleteAddress: (id) => request('delete', `/me/addresses/${segment(id)}`),
  checkout: (signal) => request('get', '/checkout', { signal }),
  selectAddress: (addressId) => request('patch', '/checkout/address', { data: { addressId } }),
  selectDelivery: (deliveryMethod) => request('patch', '/checkout/delivery', { data: { deliveryMethod } }),
  placeOrder: (data) => request('post', '/checkout/place-order', { data }),
  orders: (params, signal) => request('get', '/orders', { params, signal }),
  order: (id, signal) => request('get', `/orders/${segment(id)}`, { signal }),
  tracking: (id, signal) => request('get', `/orders/${segment(id)}/tracking`, { signal }),
  notifications: (params, signal) => request('get', '/notifications', { params, signal }),
  readNotification: (id) => request('patch', `/notifications/${segment(id)}/read`),
  readAllNotifications: () => request('patch', '/notifications/read-all'),
};

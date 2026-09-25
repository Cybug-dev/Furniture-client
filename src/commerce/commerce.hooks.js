import { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '../auth/auth.hooks.js';
import { commerceApi } from './commerce.api.js';
import { trackingInterval } from './commerce.utils.js';

export function useAccountQuery(resource, queryFn, { key = [], enabled = true, ...options } = {}) {
  const { data: user } = useCurrentUser();
  return useQuery({
    queryKey: [resource, user?.id, ...key],
    queryFn: ({ signal }) => queryFn(signal),
    enabled: Boolean(user?.id) && enabled,
    meta: { private: true },
    staleTime: 30_000,
    // Account screens expose an explicit retry control. Avoid multiplying a
    // temporary Worker failure across every private query on the page.
    retry: false,
    ...options,
  });
}
export const useCart = () => useAccountQuery('cart', commerceApi.cart);
export const useAddresses = () => useAccountQuery('addresses', commerceApi.addresses);
export const useCheckout = () => useAccountQuery('checkout', commerceApi.checkout, { staleTime: 0 });
export const useOrders = (page = 1, view) => useAccountQuery('orders', (signal) => commerceApi.orders({ page, limit: 10, ...(view ? { view } : {}) }, signal), { key: ['list', { page, view }] });
export const useOrder = (id) => useAccountQuery('orders', (signal) => commerceApi.order(id, signal), { key: [id], enabled: Boolean(id) });
export const useTracking = (id) => useAccountQuery('orders', (signal) => commerceApi.tracking(id, signal), { key: [id, 'tracking'], enabled: Boolean(id), refetchInterval: trackingInterval, refetchIntervalInBackground: false, staleTime: 0 });
export const useNotifications = (page = 1, unread = false) => useAccountQuery('notifications', (signal) => commerceApi.notifications({ page, limit: 10, ...(unread ? { unread: true } : {}) }, signal), { key: [{ page, unread }], refetchInterval: 60_000, refetchIntervalInBackground: false });

// A ref lock rejects same-frame double clicks before React updates disabled state.
// No optimistic price arithmetic: display the cart/quote returned by the server.
export function useAccountMutation(action, resources = [], cacheResource) {
  const { data: user } = useCurrentUser();
  const client = useQueryClient();
  const lock = useRef(false);
  const mutation = useMutation({
    mutationFn: commerceApi[action], retry: false,
    onMutate: async () => {
      await Promise.all(resources.map((resource) => client.cancelQueries({ queryKey: [resource, user?.id] })));
    },
    onSuccess: async (data) => {
      if (client.getQueryData(['auth', 'me'])?.id !== user?.id) return;
      if (cacheResource) client.setQueryData([cacheResource, user.id], data);
      if (action === 'placeOrder') {
        try { sessionStorage.setItem(`furniture:checkout-reminder:${user.id}`, 'shown'); } catch { /* UI only. */ }
        client.setQueryData(['orders', user.id, data.id], data);
        // Do not start a replacement checkout while the review screen is still
        // mounted. The next checkout visit will restore fresh server state.
        client.invalidateQueries({ queryKey: ['checkout', user.id], refetchType: 'none' });
      }
      await Promise.all(resources.filter((resource) => resource !== cacheResource && !(action === 'placeOrder' && resource === 'checkout')).map((resource) => client.invalidateQueries({ queryKey: [resource, user.id] })));
    },
  });
  const run = async (input) => {
    if (lock.current) return undefined;
    lock.current = true;
    try { return await mutation.mutateAsync(input); }
    finally { lock.current = false; }
  };
  return { ...mutation, run };
}

export function useAddToCart() {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useAccountMutation('addItem', ['cart', 'checkout'], 'cart');
  const add = async (productId, quantity = 1) => {
    if (!user) {
      navigate('/auth', { state: { from: `/products/${encodeURIComponent(productId)}` } });
      return null;
    }
    try { return await mutation.run({ productId, quantity }); }
    catch (error) {
      if (error.status === 401) {
        navigate('/auth', { state: { from: location.pathname } });
        return null;
      }
      throw error;
    }
  };
  return { ...mutation, add };
}

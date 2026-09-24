export const DELIVERY_METHODS = [
  { id: 'STANDARD_HOME', name: 'Standard home delivery', description: 'Delivery to your doorstep.' },
  { id: 'ROOM_PLACEMENT', name: 'Room placement', description: 'Delivery and placement in your preferred room.' },
  { id: 'PREMIUM_SETUP', name: 'Premium setup', description: 'Delivery, room placement and setup.' },
];
export const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DISPATCH', 'OUT_FOR_DELIVERY', 'DELIVERED'];
export const isTerminal = (status) => ['DELIVERED', 'CANCELLED'].includes(status);
export const isPrivateQuery = (query) => query.meta?.private === true || ['cart', 'addresses', 'checkout', 'orders', 'notifications'].includes(query.queryKey[0]);
export const label = (value = '') => value.toLowerCase().replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
export const deliveryLabel = (method) => DELIVERY_METHODS.find((item) => item.id === method)?.name || label(method);
export const cartCount = (cart) => (cart?.items || []).reduce((sum, item) => sum + item.quantity, 0);
export const money = (value, currency = 'NGN') => value == null ? 'Not yet quoted' : new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(Number(value));
export const date = (value, time = false) => value ? new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', ...(time ? { timeStyle: 'short' } : {}) }).format(new Date(value)) : 'Not yet available';
export const arrival = (data) => data?.estimatedDeliveryFrom && data?.estimatedDeliveryTo ? `${date(data.estimatedDeliveryFrom)} – ${date(data.estimatedDeliveryTo)}` : 'Choose delivery for an estimate';
export const canReview = (checkout) => Boolean(checkout?.cart?.items.length && checkout.cart.items.every(item => item.available && item.quantity >= 1 && item.quantity <= Math.min(99, item.stockQuantity)) && checkout.selectedAddressId && checkout.deliveryMethod && checkout.deliveryFee != null && checkout.quote?.serviceable !== false);
export const resumePath = (checkout) => canReview(checkout) ? '/checkout/review' : '/checkout/delivery';
export const trackingInterval = (query) => query.state.error?.status === 401 || query.state.error?.status === 404 || isTerminal(query.state.data?.status) ? false : 30_000;

// Store only a random submission key, not user data, tokens, addresses or cart contents.
// Retain the key after ambiguous network failures so a manual retry is idempotent.
const submissionKeys = new Map();
export function submissionKey(checkoutId, storage) {
  try { storage ??= globalThis.sessionStorage; } catch { /* Storage may be blocked. */ }
  const name = `furniture:order-attempt:${checkoutId}`;
  let key = submissionKeys.get(name);
  try { key ||= storage?.getItem(name); } catch { /* Storage can be disabled. */ }
  key ||= globalThis.crypto.randomUUID();
  submissionKeys.set(name, key);
  try { storage?.setItem(name, key); } catch { /* In-memory fallback for this tab. */ }
  return key;
}

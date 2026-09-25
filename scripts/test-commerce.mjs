// Contract fixtures are isolated to this test; the application never uses mock data.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';

process.env.VITE_API_URL = 'https://furniture.example.test/api';
process.env.VITE_NEON_AUTH_URL = 'https://auth.example.test/neondb/auth';
const originalFetch = globalThis.fetch;
const authToken = `${Buffer.from('{"alg":"EdDSA"}').toString('base64url')}.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 900 })).toString('base64url')}.signature`;
globalThis.fetch = async (url) => {
  const path = new URL(url).pathname;
  if (path.endsWith('/get-session')) return Response.json({ user: { id: 'test-account-a', email: 'test@example.invalid' }, session: { token: authToken } });
  if (path.endsWith('/sign-out')) return Response.json({ success: true });
  throw new Error(`Unexpected network request in commerce test: ${path}`);
};

const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
const load = (path) => server.ssrLoadModule(`/src/${path}`);
const { queryClient } = await load('query/queryClient.js');
const { default: api } = await load('api/client.js');
const { commerceApi } = await load('commerce/commerce.api.js');
const utils = await load('commerce/commerce.utils.js');
const hooks = await load('commerce/commerce.hooks.js');
const ui = await load('commerce/components/CommerceUI.jsx');
const user = { id: 'test-account-a', firstName: 'Ada', lastName: 'Test', email: 'test@example.invalid', emailVerified: true };
const item = { id: 'line-1', productId: 'product-1', productName: 'Saved sofa snapshot', slug: 'sofa', imageUrl: null, unitPrice: '12500.00', quantity: 2, lineTotal: '25000.00', available: true, stockQuantity: 10 };
const cart = { id: 'cart-1', items: [item], subtotal: '25000.00', currency: 'NGN' };
const address = { id: 'address-1', recipientName: 'Ada Test', phone: '+2348012345678', addressLine1: '12 Test Street', addressLine2: '', area: 'Ikoyi', lga: 'Eti Osa', city: 'Lagos', state: 'Lagos', country: 'Nigeria', landmark: '', postcode: '', deliveryInstructions: '', isDefault: true };
const checkout = { id: 'checkout-1', selectedAddressId: address.id, deliveryMethod: 'STANDARD_HOME', deliveryFee: '5000.00', estimatedDeliveryFrom: '2026-09-26T12:00:00Z', estimatedDeliveryTo: '2026-09-28T12:00:00Z', expiresAt: '2026-09-24T12:00:00Z', cart, isDemo: true, notice: 'Demo only.' };
const order = { id: 'order-1', orderNumber: 'FUR-TEST-1', status: 'PROCESSING', subtotal: '25000.00', deliveryFee: '5000.00', discountAmount: '0.00', total: '30000.00', currency: 'NGN', deliveryMethod: checkout.deliveryMethod, estimatedDeliveryFrom: checkout.estimatedDeliveryFrom, estimatedDeliveryTo: checkout.estimatedDeliveryTo, paymentMethod: 'DEMO_CHECKOUT', paymentStatus: 'DEMO_NOT_CHARGED', isDemo: true, placedAt: '2026-09-23T12:00:00Z', deliveredAt: null, notice: 'No payment is collected.', items: [item], address, events: [{ id: 'event-1', status: 'PLACED', title: 'Placed', message: 'Server recorded placement.', occurredAt: '2026-09-23T12:00:00Z' }, { id: 'event-2', status: 'PROCESSING', title: 'Processing', message: 'Server recorded processing.', occurredAt: '2026-09-23T12:02:00Z' }] };
const notification = { id: 'notice-1', type: 'ORDER_PROCESSING', title: 'Your order is processing', message: 'Saved server message.', orderId: order.id, readAt: null, createdAt: order.placedAt };
function seed() {
  queryClient.clear();
  // Static rendering has no mount effects; treat seeded checkout as settled.
  queryClient.setQueryDefaults(['checkout'], { refetchOnMount: false });
  queryClient.setQueryData(['auth', 'me'], user);
  queryClient.setQueryData(['cart', user.id], cart);
  queryClient.setQueryData(['addresses', user.id], [address]);
  queryClient.setQueryData(['checkout', user.id], checkout);
  queryClient.setQueryData(['orders', user.id, order.id], order);
  queryClient.setQueryData(['orders', user.id, order.id, 'tracking'], order);
  queryClient.setQueryData(['orders', user.id, 'list', { page: 1, view: undefined }], { items: [order], page: 1, pages: 1, total: 1, limit: 10 });
  queryClient.setQueryData(['notifications', user.id, { page: 1, unread: false }], { items: [notification], page: 1, pages: 1, total: 1, unreadCount: 1, limit: 10 });
}
function render(Component, path = '/', route = '*', props = {}) {
  return renderToStaticMarkup(React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(MemoryRouter, { initialEntries: [path] }, React.createElement(Routes, null, React.createElement(Route, { path: route, element: React.createElement(Component, props) })))));
}
const response = (config, data) => ({ config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data } });
try {
  await test('all commerce endpoints use the contract and authenticated shared client', async () => {
    const calls = [];
    api.defaults.adapter = async (config) => { calls.push(config); return response(config, { marker: 'unwrapped' }); };
    const cases = [
      ['cart', [], 'get', '/cart'], ['addItem', [{ productId: 'p', quantity: 1 }], 'post', '/cart/items'],
      ['updateItem', [{ id: 'i', quantity: 2 }], 'patch', '/cart/items/i'], ['removeItem', ['i'], 'delete', '/cart/items/i'], ['clearCart', [], 'delete', '/cart'],
      ['addresses', [], 'get', '/me/addresses'], ['saveAddress', [{ recipientName: 'A' }], 'post', '/me/addresses'], ['saveAddress', [{ id: 'a', recipientName: 'B' }], 'patch', '/me/addresses/a'], ['deleteAddress', ['a'], 'delete', '/me/addresses/a'],
      ['checkout', [], 'get', '/checkout'], ['selectAddress', ['a'], 'patch', '/checkout/address'], ['selectDelivery', ['STANDARD_HOME'], 'patch', '/checkout/delivery'],
      ['placeOrder', [{ checkoutSessionId: 'c', idempotencyKey: 'k', paymentMethod: 'DEMO_CHECKOUT', demoAcknowledged: true }], 'post', '/checkout/place-order'],
      ['orders', [{ page: 2, limit: 10, view: 'active' }], 'get', '/orders'], ['order', ['o'], 'get', '/orders/o'], ['tracking', ['o'], 'get', '/orders/o/tracking'],
      ['notifications', [{ page: 1, unread: true }], 'get', '/notifications'], ['readNotification', ['n'], 'patch', '/notifications/n/read'], ['readAllNotifications', [], 'patch', '/notifications/read-all'],
    ];
    for (const [name, args, method, url] of cases) {
      assert.deepEqual(await commerceApi[name](...args), { marker: 'unwrapped' });
      const call = calls.at(-1);
      assert.equal(call.method, method); assert.equal(call.url, url); assert.equal(call.withCredentials, true); assert.equal(call.requiresAuth, true);
      if (call.data) { const body = JSON.parse(call.data); assert.ok(!('userId' in body)); assert.ok(!('price' in body)); assert.ok(!('total' in body)); }
    }
    assert.deepEqual(JSON.parse(calls.find(c => c.url === '/checkout/address').data), { addressId: 'a' });
    assert.deepEqual(JSON.parse(calls.find(c => c.url === '/cart/items/i' && c.method === 'patch').data), { quantity: 2 });
    assert.deepEqual(calls.find(c => c.url === '/orders').params, { page: 2, limit: 10, view: 'active' });
  });
  await test('checkout readiness, empty cart and resume respect the saved server session', () => {
    assert.equal(utils.canReview(checkout), true);
    assert.equal(utils.resumePath(checkout), '/checkout/review');
    for (const partial of [{ deliveryMethod: null }, { selectedAddressId: null }, { deliveryFee: null }, { quote: { serviceable: false } }, { cart: { items: [] } }]) assert.equal(utils.canReview({ ...checkout, ...partial }), false);
    assert.equal(utils.resumePath({ ...checkout, deliveryMethod: null }), '/checkout/delivery');
    assert.equal(utils.cartCount(cart), 2);
  });
  await test('idempotency keys survive retries and storage failures', () => {
    const store = new Map();
    const storage = { getItem: key => store.get(key), setItem: (key, value) => store.set(key, value) };
    const first = utils.submissionKey('session-one', storage);
    assert.equal(utils.submissionKey('session-one', storage), first);
    assert.notEqual(utils.submissionKey('session-two', storage), first);
    const blocked = { getItem() { throw Error('blocked'); }, setItem() { throw Error('blocked'); } };
    assert.equal(utils.submissionKey('session-three', blocked), utils.submissionKey('session-three', blocked));
  });
  await test('tracking polls active orders and stops on terminal or inaccessible orders', () => {
    for (const status of utils.ORDER_STEPS.slice(0, -1)) assert.equal(utils.trackingInterval({ state: { data: { status } } }), 30000);
    for (const status of ['DELIVERED', 'CANCELLED']) assert.equal(utils.trackingInterval({ state: { data: { status } } }), false);
    assert.equal(utils.trackingInterval({ state: { error: { status: 401 } } }), false);
    assert.equal(utils.trackingInterval({ state: { error: { status: 404 } } }), false);
  });
  await test('cart screen renders server line totals, quantity controls and existing product links', async () => {
    seed(); const { default: Cart } = await load('commerce/pages/CartPage.jsx');
    const html = render(Cart, '/cart');
    assert.match(html, /Your cart \(2 items\)/); assert.match(html, /\/products\/product-1/); assert.match(html, /Decrease quantity/); assert.match(html, /25,000/); assert.match(html, /Proceed to checkout/);
    queryClient.setQueryData(['cart', user.id], { ...cart, items: [] });
    const empty = render(Cart, '/cart'); assert.match(empty, /Your cart is empty/); assert.doesNotMatch(empty, /Order summary|Proceed to checkout/);
  });
  await test('delivery and review render saved address, server quote, and explicit disabled demo acknowledgement', async () => {
    seed(); const { DeliveryPage, ReviewPage } = await load('commerce/pages/CheckoutPage.jsx');
    const delivery = render(DeliveryPage, '/checkout/delivery');
    assert.match(delivery, /12 Test Street/); assert.match(delivery, /5,000/); assert.match(delivery, /Continue to review/);
    const review = render(ReviewPage, '/checkout/review');
    assert.match(review, /No payment is collected and no physical delivery occurs/); assert.match(review, /I understand this is a demo order/);
    assert.match(review, /<button[^>]*disabled=""[^>]*>Place demo order/);
    assert.doesNotMatch(review, /name="(card|cvc|cardNumber)"/);
    assert.doesNotMatch(review, /30,000/); // Checkout API does not supply a total; do not invent one.
  });
  await test('order confirmation and tracking use purchase snapshots, event messages and server total', async () => {
    seed(); const { OrderDetailPage, OrderConfirmationPage } = await load('commerce/pages/OrdersPage.jsx');
    const html = render(OrderDetailPage, '/orders/order-1', '/orders/:orderId');
    assert.match(html, /Saved sofa snapshot/); assert.match(html, /Server recorded processing/); assert.match(html, /12 Test Street/); assert.match(html, /30,000/);
    assert.doesNotMatch(html, />Edit address</);
    const confirmation = render(OrderConfirmationPage, '/order-confirmation/order-1', '/order-confirmation/:orderId');
    assert.match(confirmation, /Your order is confirmed/); assert.match(confirmation, /FUR-TEST-1/); assert.match(confirmation, /Track your order/); assert.match(confirmation, /What&#x27;s next/);
  });
  await test('product quantity stays usable when catalogue stock metadata is omitted', async () => {
    seed();
    const product = { id: 'product-unknown-stock', name: 'Stock checked sofa', price: '12000.00', status: 'ACTIVE', images: [], description: 'A test product.' };
    queryClient.setQueryDefaults(['products'], { refetchOnMount: false });
    queryClient.setQueryData(['products', 'detail', product.id], { success: true, data: product });
    queryClient.setQueryData(['products', 'list', { category: undefined, limit: 4, page: 1 }], { data: [] });
    const { default: ProductDetail } = await load('components/ProductsDetails/ProductDetail.jsx');
    const html = render(ProductDetail, `/products/${product.id}`, '/products/:id');
    assert.match(html, /aria-label="Increase quantity"/);
    assert.doesNotMatch(html, /aria-label="Increase quantity" disabled/);
    assert.match(html, />Add To Cart</);
    assert.match(html, /Confirmed when added to cart/);
  });
  await test('orders, notifications and profile render actual query data and empty states', async () => {
    seed(); const { default: Orders } = await load('commerce/pages/OrdersPage.jsx');
    assert.match(render(Orders, '/orders'), /FUR-TEST-1/);
    const { default: Notifications } = await load('commerce/pages/NotificationsPage.jsx');
    const html = render(Notifications, '/notifications'); assert.match(html, /Saved server message/); assert.match(html, /Unread/); assert.match(html, /View order/);
    const { default: Profile } = await load('commerce/pages/ProfilePage.jsx');
    assert.match(render(Profile, '/profile'), /Ada Test/); assert.match(render(Profile, '/profile'), /read-only/);
    queryClient.setQueryData(['notifications', user.id, { page: 1, unread: false }], { items: [], page: 1, pages: 0, total: 0, unreadCount: 0 });
    assert.match(render(Notifications, '/notifications'), /caught up/);
    queryClient.setQueryData(['orders', user.id, 'list', { page: 1, view: undefined }], { items: [], page: 1, pages: 0, total: 0 });
    assert.match(render(Orders, '/orders'), /No orders yet/);
  });
  await test('guest route protection and account-scoped keys do not expose another user cache', () => {
    seed(); queryClient.setQueryData(['auth', 'me'], null);
    const html = render(ui.AccountLayout, '/profile'); assert.doesNotMatch(html, /Ada|Test Street|Saved addresses/);
    queryClient.setQueryData(['auth', 'me'], { ...user, id: 'test-account-b' });
    let observed;
    function Probe() { observed = hooks.useAddresses(); return null; }
    render(Probe); assert.equal(observed.data, undefined);
  });
  await test('same-frame duplicate mutations are locked and update only targeted server caches', async () => {
    seed(); let mutation; let calls = 0; let release;
    api.defaults.adapter = (config) => { calls++; return new Promise(resolve => { release = () => resolve(response(config, { ...cart, items: [{ ...item, quantity: 3 }] })); }); };
    function Probe() { mutation = hooks.useAccountMutation('updateItem', ['cart', 'checkout'], 'cart'); return null; }
    render(Probe);
    const pending = mutation.run({ id: item.id, quantity: 3 });
    assert.equal(await mutation.run({ id: item.id, quantity: 3 }), undefined);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls, 1); release(); await pending;
    assert.equal(queryClient.getQueryData(['cart', user.id]).items[0].quantity, 3);
    assert.equal(queryClient.getQueryState(['checkout', user.id]).isInvalidated, true);
    assert.equal(queryClient.getQueryState(['addresses', user.id]).isInvalidated, false);
  });
  await test('failed mutation preserves the server cart and exposes a normalized validation error', async () => {
    seed(); api.defaults.adapter = async (config) => { throw new AxiosError('bad request', 'ERR_BAD_REQUEST', config, {}, { status: 400, data: { success: false, message: 'Quantity must be between 1 and 99' } }); };
    await assert.rejects(commerceApi.updateItem({ id: item.id, quantity: 100 }), error => error.type === 'validation' && error.status === 400);
    assert.deepEqual(queryClient.getQueryData(['cart', user.id]), cart);
  });
  await test('rejected bearer auth invalidates the account session without calling legacy refresh', async () => {
    seed(); const calls = [];
    api.defaults.adapter = async (config) => { calls.push(config.url); throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, {}, { status: 401, data: { success: false, message: 'Sign in again' } }); };
    await assert.rejects(commerceApi.cart(), error => error.status === 401);
    assert.deepEqual(calls, ['/cart']); assert.equal(queryClient.getQueryData(['auth', 'me']), null);
  });
  await test('address/quote/order failures do not fake successful writes or clear the cart', async () => {
    seed();
    for (const [operation, input, status] of [
      ['saveAddress', { ...address, id: undefined }, 400],
      ['selectDelivery', 'STANDARD_HOME', 500],
      ['placeOrder', { checkoutSessionId: checkout.id, idempotencyKey: 'same-key', paymentMethod: 'DEMO_CHECKOUT', demoAcknowledged: true }, 409],
    ]) {
      let calls = 0;
      api.defaults.adapter = async (config) => { calls++; throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, {}, { status, data: { success: false, message: 'Test failure' } }); };
      await assert.rejects(commerceApi[operation](input), error => error.status === status);
      assert.equal(calls, 1);
      assert.deepEqual(queryClient.getQueryData(['cart', user.id]), cart);
      assert.deepEqual(queryClient.getQueryData(['checkout', user.id]), checkout);
    }
  });
  await test('manual order retries send the same session/key without automatic retry', async () => {
    seed(); const calls = [];
    const payload = { checkoutSessionId: checkout.id, idempotencyKey: utils.submissionKey(checkout.id, { getItem: () => null, setItem() {} }), paymentMethod: 'DEMO_CHECKOUT', demoAcknowledged: true };
    api.defaults.adapter = async (config) => {
      calls.push(JSON.parse(config.data));
      if (calls.length === 1) throw new AxiosError('Network error', 'ERR_NETWORK', config, {});
      return { ...response(config, order), data: { success: true, data: order, replayed: true } };
    };
    await assert.rejects(commerceApi.placeOrder(payload)); assert.equal(calls.length, 1);
    assert.deepEqual(await commerceApi.placeOrder(payload), order);
    assert.deepEqual(calls[0], calls[1]);
  });
  await test('successful order mutation caches the order and refreshes only commerce state', async () => {
    seed(); let mutation;
    api.defaults.adapter = async config => response(config, order);
    function Probe() { mutation = hooks.useAccountMutation('placeOrder', ['cart', 'orders', 'notifications', 'checkout']); return null; }
    render(Probe);
    const saved = await mutation.run({ checkoutSessionId: checkout.id, idempotencyKey: 'test-key', paymentMethod: 'DEMO_CHECKOUT', demoAcknowledged: true });
    assert.equal(saved.id, order.id);
    assert.deepEqual(queryClient.getQueryData(['orders', user.id, order.id]), order);
    for (const key of [['cart', user.id], ['checkout', user.id], ['notifications', user.id, { page: 1, unread: false }]]) assert.equal(queryClient.getQueryState(key).isInvalidated, true);
    assert.equal(queryClient.getQueryState(['auth', 'me']).isInvalidated, false);
    assert.equal(queryClient.getQueryState(['addresses', user.id]).isInvalidated, false);
  });
  await test('logout purges private caches, including details cached before their first render', async () => {
    seed(); api.defaults.adapter = async config => response(config, { loggedOut: true });
    const { useLogout } = await load('auth/auth.hooks.js'); let mutation;
    function Probe() { mutation = useLogout(); return null; }
    render(Probe); await mutation.mutateAsync();
    assert.equal(queryClient.getQueryData(['auth', 'me']), null);
    assert.equal(queryClient.getQueryCache().findAll({ predicate: utils.isPrivateQuery }).length, 0);
  });
  await test('cancelled tracking displays only real events and no invented delivery event', async () => {
    seed();
    const cancelled = { ...order, status: 'CANCELLED', events: [order.events[0], { id: 'cancel-event', status: 'CANCELLED', title: 'Cancelled', message: 'Server cancellation record.', occurredAt: order.placedAt }] };
    queryClient.setQueryData(['orders', user.id, order.id, 'tracking'], cancelled);
    const { OrderDetailPage } = await load('commerce/pages/OrdersPage.jsx');
    const html = render(OrderDetailPage, '/orders/order-1', '/orders/:orderId');
    assert.match(html, /Server cancellation record/); assert.match(html, /automatic tracking refresh has stopped/);
    assert.doesNotMatch(html, /Delivered · Current status/);
  });
} finally {
  globalThis.fetch = originalFetch;
  queryClient.clear();
  await server.close();
}

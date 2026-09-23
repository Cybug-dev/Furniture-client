import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createServer } from 'vite';
import { AxiosError } from 'axios';

process.env.VITE_API_URL = 'https://furniture.example.test/api';
process.env.VITE_NEON_AUTH_URL = 'https://auth.example.test/neondb/auth';
const server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom', logLevel: 'error' });
const load = (path) => server.ssrLoadModule(`/src/${path}`);
const auth = await load('auth/auth.api.js');
const { authResult, getAccessToken, invalidateAuthRequests } = await load('auth/auth.client.js');
const { default: api } = await load('api/client.js');
const realFetch = globalThis.fetch;
const calls = [];
const apiCalls = [];
const jwt = `${Buffer.from('{"alg":"EdDSA"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: 'neon-user', exp: Math.floor(Date.now() / 1000) + 900 })).toString('base64url')}.signature`;
const user = { id: 'neon-user', email: 'ada@example.test', emailVerified: true, name: 'Ada Test', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
const profile = { id: 'app-user', email: user.email, firstName: 'Ada', role: 'USER', emailVerified: true };
const session = { user, session: { id: 'session', userId: user.id, token: jwt, expiresAt: new Date(Date.now() + 3600_000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } };
let signedIn = false;
let loginFailure = null;
globalThis.fetch = async (url, init) => {
  calls.push({ path: new URL(url).pathname, init });
  const path = new URL(url).pathname;
  if (path.endsWith('/sign-up/email')) return Response.json({ user: { ...user, emailVerified: false }, token: null });
  if (path.endsWith('/sign-in/email')) {
    if (loginFailure) return Response.json(loginFailure, { status: loginFailure.status });
    signedIn = true;
    return Response.json(session);
  }
  if (path.endsWith('/email-otp/verify-email')) { signedIn = true; return Response.json({ status: true, ...session }); }
  if (path.endsWith('/email-otp/send-verification-otp')) return Response.json({ success: true });
  if (path.endsWith('/get-session')) return Response.json(signedIn ? session : null);
  if (path.endsWith('/sign-out')) { signedIn = false; return Response.json({ success: true }); }
  throw new Error(`Unexpected auth request: ${path}`);
};
api.defaults.adapter = async (config) => {
  apiCalls.push(config);
  return { status: 200, headers: {}, config, data: { success: true, data: { user: profile } } };
};
try {
  await test('guests and public catalogue requests do not need bearer credentials', async () => {
    assert.equal(await auth.getCurrentUser(), null);
    const before = calls.length;
    await api.get('/products');
    assert.equal(calls.length, before);
    assert.equal(apiCalls.at(-1).headers.get('Authorization'), undefined);
  });
  await test('sign-up normalizes email, preserves password, and requests Neon registration', async () => {
    const result = await auth.registerUser({ email: ' ADA@EXAMPLE.TEST ', password: 'Long test password 123', firstName: 'Ada', lastName: 'Test' });
    assert.equal(result.emailVerified, false);
    const call = calls.find((entry) => entry.path.endsWith('/sign-up/email'));
    assert.equal(call.init.credentials, 'include');
    assert.deepEqual(JSON.parse(call.init.body), { email: user.email, password: 'Long test password 123', name: 'Ada Test' });
    assert.equal(apiCalls.some((call) => call.url === '/auth/register'), false);
  });
  await test('real SDK thrown errors retain invalid credentials and verification requirements', async () => {
    loginFailure = { status: 401, code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Invalid email or password' };
    await assert.rejects(auth.loginUser({ email: user.email, password: 'wrong' }), (error) => error.status === 401 && error.type !== 'network');
    loginFailure = { status: 403, code: 'EMAIL_NOT_VERIFIED', message: 'Email not verified' };
    await assert.rejects(auth.loginUser({ email: user.email, password: 'correct' }), (error) => error.code === 'EMAIL_NOT_VERIFIED');
    loginFailure = null;
  });
  await test('verification and resend use OTP methods and synchronize the application profile', async () => {
    await auth.resendVerification({ email: user.email });
    assert.deepEqual(JSON.parse(calls.at(-1).init.body), { email: user.email, type: 'email-verification' });
    assert.deepEqual(await auth.verifyEmail({ email: user.email, otp: '123456' }), profile);
  });
  await test('login and concurrent protected requests use the Neon JWT without legacy refresh', async () => {
    assert.deepEqual(await auth.loginUser({ email: user.email, password: 'Long test password 123' }), profile);
    await Promise.all(Array.from({ length: 10 }, () => api.get('/cart', { requiresAuth: true })));
    for (const call of apiCalls.filter((call) => call.requiresAuth)) assert.equal(call.headers.get('Authorization'), `Bearer ${jwt}`);
    assert.equal(apiCalls.some((call) => call.url === '/auth/refresh' || call.url === '/auth/login'), false);
    const first = getAccessToken();
    assert.equal(getAccessToken(), first);
    await first;
    await assert.rejects(api.get('https://unrelated.example/cart', { requiresAuth: true }));
  });
  await test('API failures stay visible and do not replay writes or misreport a successful login', async () => {
    api.defaults.adapter = async (config) => { throw new AxiosError('unavailable', 'ERR_BAD_RESPONSE', config, {}, { status: 503, data: {} }); };
    await assert.rejects(auth.loginUser({ email: user.email, password: 'Long test password 123' }), (error) => error.status === 503 && error.type === 'server');
  });
  await test('logout invalidates pending credentials and protected requests require a new session', async () => {
    const pending = getAccessToken();
    invalidateAuthRequests();
    await assert.rejects(pending, (error) => error.status === 401);
    await auth.logoutUser();
    assert.equal(await auth.getCurrentUser(), null);
    await assert.rejects(getAccessToken(), (error) => error.status === 401);
  });
  await test('transport failure remains distinct from invalid credentials', async () => {
    await assert.rejects(authResult(Promise.reject(new TypeError('fetch failed'))), (error) => error.type === 'network' && error.status === null);
    await assert.rejects(authResult(Promise.resolve({ error: { status: 429 } })), (error) => error.status === 429);
  });
} finally {
  globalThis.fetch = realFetch;
  await server.close();
}

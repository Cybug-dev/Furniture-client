import { createAuthClient, isAuthError } from '@neondatabase/neon-js/auth';
import { BetterAuthVanillaAdapter } from '@neondatabase/neon-js/auth/vanilla/adapters';

let client;
let tokenRequest;
let cachedAccessToken;
let sessionVersion = 0;

function tokenIsFresh(token) {
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    return Number(payload.exp) * 1000 > Date.now() + 30_000;
  } catch {
    return false;
  }
}

export function getAuthClient() {
  if (!client) {
    const url = import.meta.env.VITE_NEON_AUTH_URL?.trim();
    let validUrl = false;
    try { validUrl = new URL(url).protocol === 'https:'; } catch { /* Missing or invalid configuration. */ }
    if (!validUrl) {
      throw Object.assign(new Error('Account access is not configured. Please contact support.'), {
        name: 'AuthError', type: 'configuration', status: null,
      });
    }
    client = createAuthClient(url, {
      adapter: BetterAuthVanillaAdapter({
        fetchOptions: { credentials: 'include', timeout: 15_000, retry: 0 },
      }),
    });
  }
  return client;
}

export async function authResult(request) {
  try {
    const { data, error } = await request;
    if (error) throw error;
    return data;
  } catch (error) {
    if (isAuthError(error) || typeof error?.status === 'number') {
      const status = error.status ?? null;
      const code = ['EMAIL_NOT_VERIFIED', 'email_not_confirmed'].includes(error.code)
        ? 'EMAIL_NOT_VERIFIED' : error.code ?? null;
      const message = code === 'EMAIL_NOT_VERIFIED'
        ? 'Verify your email using the code in your inbox before signing in.'
        : code === 'INVALID_EMAIL_OR_PASSWORD'
          ? 'Email or password is incorrect.'
        : status === 429 ? 'Too many attempts. Please wait before trying again.'
          : status >= 500 ? 'Account access is temporarily unavailable. Please try again.'
            : error.message || 'Unable to complete the account request.';
      throw Object.assign(new Error(message), {
        name: 'AuthError', status, code,
        type: status === 401 ? 'unauthorized' : 'auth',
      });
    }
    if (error.name === 'AuthError') throw error;
    throw Object.assign(new Error('Unable to reach the account service. Please try again.'), {
      name: 'AuthError', status: null, type: 'network',
    });
  }
}

export function invalidateAuthRequests() {
  sessionVersion += 1;
  tokenRequest = null;
  cachedAccessToken = null;
}

export function getAccessToken() {
  if (cachedAccessToken && tokenIsFresh(cachedAccessToken)) {
    if (!tokenRequest) {
      const version = sessionVersion;
      const pending = Promise.resolve().then(() => {
        if (version !== sessionVersion) {
          throw Object.assign(new Error('Please sign in to continue.'), {
            name: 'AuthError', status: 401, type: 'unauthorized',
          });
        }
        return cachedAccessToken;
      }).finally(() => { if (tokenRequest === pending) tokenRequest = null; });
      tokenRequest = pending;
    }
    return tokenRequest;
  }
  cachedAccessToken = null;
  if (!tokenRequest) {
    const version = sessionVersion;
    const pending = authResult(getAuthClient().getSession())
      .then((data) => {
        // Neon replaces session.token with its short-lived JWT and caches it
        // in memory. Never use or persist an opaque session cookie as a bearer.
        const token = data?.session?.token;
        if (version !== sessionVersion || !data?.user || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token || '')) {
          throw Object.assign(new Error('Please sign in to continue.'), {
            name: 'AuthError', status: 401, type: 'unauthorized',
          });
        }
        cachedAccessToken = token;
        return cachedAccessToken;
      })
      .finally(() => { if (tokenRequest === pending) tokenRequest = null; });
    tokenRequest = pending;
  }
  return tokenRequest;
}

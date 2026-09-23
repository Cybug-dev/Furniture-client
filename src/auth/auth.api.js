import api from '../api/client.js';
import { authResult, getAuthClient, invalidateAuthRequests } from './auth.client.js';

const readUser = (response) => {
  const user = response.data?.data?.user;

  if (!user) {
    throw new Error('The server returned an invalid authentication response.');
  }

  return user;
};

export const registerUser = async ({ email, password, firstName, lastName }) => {
  const result = await authResult(getAuthClient().signUp.email({
    email: email.trim().toLowerCase(),
    password,
    name: [firstName, lastName].filter(Boolean).join(' ').trim(),
  }));
  invalidateAuthRequests();
  return result?.user;
};

export const loginUser = async ({ email, password }) => {
  await authResult(getAuthClient().signIn.email({ email: email.trim().toLowerCase(), password }));
  invalidateAuthRequests();
  // Do not report login success until the backend accepts the Neon identity.
  return readUser(await api.get('/auth/me', { requiresAuth: true }));
};

export const getCurrentUser = async () => {
  try {
    const session = await authResult(getAuthClient().getSession());
    if (!session?.user) return null;
    const response = await api.get('/auth/me', { requiresAuth: true });

    return readUser(response);
  } catch (error) {
    if (error.status === 401) {
      return null;
    }

    throw error;
  }
};

export const logoutUser = async () => {
  try {
    return await authResult(getAuthClient().signOut());
  } finally {
    invalidateAuthRequests();
  }
};

export const verifyEmail = async ({ email, otp }) => {
  await authResult(getAuthClient().emailOtp.verifyEmail({ email, otp }));
  invalidateAuthRequests();
  return getCurrentUser();
};

export const resendVerification = ({ email }) => authResult(
  getAuthClient().emailOtp.sendVerificationOtp({ email, type: 'email-verification' }),
);

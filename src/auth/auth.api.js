import api from '../api/client.js';
import { authResult, getAccessToken, getAuthClient, invalidateAuthRequests } from './auth.client.js';

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
    await getAccessToken();
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

export const requestPasswordReset = ({ email }) => authResult(
  getAuthClient().emailOtp.requestPasswordReset({
    email: email.trim().toLowerCase(),
  }),
);

export const resetPassword = async ({ email, otp, password }) => {
  const result = await authResult(getAuthClient().emailOtp.resetPassword({
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
    password,
  }));
  invalidateAuthRequests();
  return result;
};

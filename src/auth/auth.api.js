import api from '../api/client.js';

const readUser = (response) => {
  const user = response.data?.data?.user;

  if (!user) {
    throw new Error('The server returned an invalid authentication response.');
  }

  return user;
};

export const registerUser = async ({ email, password, firstName, lastName }) => {
  const response = await api.post('/auth/register', {
    email,
    password,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
  });

  return readUser(response);
};

export const loginUser = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });

  return readUser(response);
};

export const getCurrentUser = async () => {
  try {
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
  const response = await api.post('/auth/logout');

  return response.data;
};

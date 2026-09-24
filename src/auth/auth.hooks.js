import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isPrivateQuery } from '../commerce/commerce.utils.js';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from './auth.api.js';

export const AUTH_USER_QUERY_KEY = ['auth', 'me'];

export const useCurrentUser = () =>
  useQuery({
    queryKey: AUTH_USER_QUERY_KEY,
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 60_000,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: async (user) => {
      await queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY });
      await queryClient.cancelQueries({ predicate: isPrivateQuery });
      queryClient.removeQueries({ predicate: isPrivateQuery });
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, user);
      // UI-only reminder flag; no account data or tokens are persisted here.
      try {
        const key = `furniture:checkout-reminder:${user?.id}`;
        if (!sessionStorage.getItem(key)) sessionStorage.setItem(key, 'pending');
      } catch { /* Optional UI storage can be disabled. */ }
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: registerUser,
  });

export const useRequestPasswordReset = () =>
  useMutation({
    mutationFn: requestPasswordReset,
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: resetPassword,
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY });
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
      await queryClient.cancelQueries({ predicate: isPrivateQuery });
      queryClient.removeQueries({ predicate: isPrivateQuery });
    },
  });
};

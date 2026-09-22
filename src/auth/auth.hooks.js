import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
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
    onSuccess: async () => {
      await queryClient.fetchQuery({
        queryKey: AUTH_USER_QUERY_KEY,
        queryFn: getCurrentUser,
        staleTime: 0,
      });
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: registerUser,
  });

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSettled: async () => {
      await queryClient.cancelQueries({ queryKey: AUTH_USER_QUERY_KEY });
      queryClient.setQueryData(AUTH_USER_QUERY_KEY, null);
    },
  });
};

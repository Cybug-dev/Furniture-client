import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCategories, getProductById, getProducts } from "../api/api.js";

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: ({ queryKey }) => getProducts(queryKey[2]),
    placeholderData: keepPreviousData,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchInterval: 30 * 60 * 1000,
  });
};

export const useProduct = (id) => {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: ({ queryKey }) => getProductById(queryKey[2]),
    enabled: id !== undefined && id !== null && id !== "",
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories", "list"],
    queryFn: getCategories,
  });
};

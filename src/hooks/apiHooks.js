import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getCategories, getProductById, getProducts } from "../api/api.js";

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: ({ queryKey }) => getProducts(queryKey[2]),
    placeholderData: keepPreviousData,
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

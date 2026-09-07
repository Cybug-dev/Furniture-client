import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts } from "../api/products.api.js";

export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: ["products", "list", params],
    queryFn: ({ queryKey }) => getProducts(queryKey[2]),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

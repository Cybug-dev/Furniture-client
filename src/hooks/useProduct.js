import { useQuery } from "@tanstack/react-query";
import { getProductById } from "../api/products.api.js";

export const useProduct = (id) => {
  return useQuery({
    queryKey: ["products", "detail", id],
    queryFn: ({ queryKey }) => getProductById(queryKey[2]),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ProductsApi } from "../api/resources";
import type { Product } from "../types/models";

// Query key kept in one place so invalidation after a create/update/delete
// stays in sync with the key used to fetch the list.
const PRODUCTS_KEY = ["products"] as const;

export function useProducts() {
  return useQuery({ queryKey: PRODUCTS_KEY, queryFn: ProductsApi.list });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Product, "id">) => ProductsApi.create(payload),
    // No optimistic UI per the spec -- just refetch the list once the write
    // succeeds so the new product shows up.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Omit<Product, "id">> }) =>
      ProductsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ProductsApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
  });
}

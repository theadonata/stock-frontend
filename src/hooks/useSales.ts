import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SalesApi } from "../api/resources";
import type { Sale } from "../types/models";

const SALES_KEY = ["sales"] as const;

export function useSales() {
  return useQuery({ queryKey: SALES_KEY, queryFn: SalesApi.list });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Sale, "id">) => SalesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}

export function useUpdateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Omit<Sale, "id">> }) =>
      SalesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}

export function useDeleteSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => SalesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SALES_KEY }),
  });
}

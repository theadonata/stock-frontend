import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExpensesApi } from "../api/resources";
import type { Expense } from "../types/models";

const EXPENSES_KEY = ["expenses"] as const;

export function useExpenses() {
  return useQuery({ queryKey: EXPENSES_KEY, queryFn: ExpensesApi.list });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Expense, "id">) => ExpensesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Omit<Expense, "id">> }) =>
      ExpensesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ExpensesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: EXPENSES_KEY }),
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createConstructorDriversBatchAction,
  createConstructorAction,
  createDriverAction,
  getActionCountries,
  searchConstructorDriverAction
} from "../../api";
import type {
  CreateDriversBatchActionInput,
  SearchConstructorDriverInput
} from "../../types";

export function useActionCountries() {
  return useQuery({
    queryKey: ["actions", "countries"],
    queryFn: getActionCountries,
    refetchOnMount: false,
    refetchOnWindowFocus: false
  });
}

export function useCreateConstructorAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConstructorAction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] })
      ]);
    }
  });
}

export function useCreateDriverAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDriverAction,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] })
      ]);
    }
  });
}

export function useSearchConstructorDriverAction() {
  return useMutation({
    mutationFn: (input: SearchConstructorDriverInput) =>
      searchConstructorDriverAction(input)
  });
}

export function useCreateConstructorDriversBatchAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateDriversBatchActionInput) =>
      createConstructorDriversBatchAction(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["reports"] })
      ]);
    }
  });
}

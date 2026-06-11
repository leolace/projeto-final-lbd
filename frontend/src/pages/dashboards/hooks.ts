import { useQuery } from "@tanstack/react-query";
import { getDashboard, getSeasons } from "../../api";

export function useDashboard(seasonId?: number) {
  return useQuery({
    queryKey: ["dashboard", seasonId],
    queryFn: async () =>
      getDashboard(seasonId ? { season: seasonId } : undefined),
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useSeasons() {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: getSeasons,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

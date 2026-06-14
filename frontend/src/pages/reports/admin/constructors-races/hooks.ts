import { useQuery } from "@tanstack/react-query";
import { getAdminConstructorsRacesReport } from "../../../../api";

export function useAdminConstructorsRacesReport() {
  return useQuery({
    queryKey: ["reports", "admin", "constructors-races"],
    queryFn: getAdminConstructorsRacesReport
  });
}

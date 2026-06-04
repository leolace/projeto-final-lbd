import { useQuery } from "@tanstack/react-query";
import { getReportRows } from "../../../../api";

export function useDriverPerformanceSummaryReport() {
  return useQuery({
    queryKey: ["reports", "driver", "performance-summary"],
    queryFn: async () =>
      getReportRows("/reports/driver/performance-summary", {
        page: 1,
        pageSize: 20
      })
  });
}

import { useQuery } from "@tanstack/react-query";
import type { ReportPaginationParams } from "../../../../api";
import { getReportRows } from "../../../../api";

export function useDriverStatusCountsReport(pagination: ReportPaginationParams) {
  return useQuery({
    queryKey: ["reports", "driver", "status-counts", pagination],
    queryFn: async () => getReportRows("/reports/driver/status-counts", pagination)
  });
}

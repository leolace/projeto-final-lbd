import { useQuery } from "@tanstack/react-query";
import type { ReportPaginationParams } from "../../../../api";
import { getReportRows } from "../../../../api";

export function useAdminStatusCountsReport(pagination: ReportPaginationParams) {
  return useQuery({
    queryKey: ["reports", "admin", "status-counts", pagination],
    queryFn: async () => getReportRows("/reports/admin/status-counts", pagination)
  });
}

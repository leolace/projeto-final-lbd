import { useQuery } from "@tanstack/react-query";
import type { ReportPaginationParams } from "../../../../api";
import { getReportRows } from "../../../../api";

export function useConstructorStatusCountsReport(
  pagination: ReportPaginationParams
) {
  return useQuery({
    queryKey: ["reports", "constructor", "status-counts", pagination],
    queryFn: async () =>
      getReportRows("/reports/constructor/status-counts", pagination)
  });
}

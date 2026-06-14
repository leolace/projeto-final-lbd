import { useQuery } from "@tanstack/react-query";
import type { ReportPaginationParams } from "../../../../api";
import { getReportRows } from "../../../../api";

export function useDriverYearPointsReport(pagination: ReportPaginationParams) {
  return useQuery({
    queryKey: ["reports", "driver", "year-points", pagination],
    queryFn: async () => getReportRows("/reports/driver/year-points", pagination)
  });
}

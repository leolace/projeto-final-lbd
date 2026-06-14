import { useQuery } from "@tanstack/react-query";
import type { ReportPaginationParams } from "../../../../api";
import { getReportRows } from "../../../../api";

export function useConstructorDriverWinsReport(
  pagination: ReportPaginationParams
) {
  return useQuery({
    queryKey: ["reports", "constructor", "driver-wins", pagination],
    queryFn: async () =>
      getReportRows("/reports/constructor/driver-wins", pagination)
  });
}

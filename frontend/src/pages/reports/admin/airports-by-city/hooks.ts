import { useQuery } from "@tanstack/react-query";
import type { ReportPaginationParams } from "../../../../api";
import { getReportRows } from "../../../../api";

export function useAdminAirportsByCityReport(
  city: string,
  pagination: ReportPaginationParams
) {
  return useQuery({
    enabled: city.trim().length > 0,
    queryKey: ["reports", "admin", "airports-by-city", city, pagination],
    queryFn: async () =>
      getReportRows("/reports/admin/airports-by-city", pagination, {
        city: city.trim()
      })
  });
}

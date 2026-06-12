import { useQuery } from "@tanstack/react-query";
import type { ReportPaginationParams } from "../../../../api";
import { getReportRows } from "../../../../api";

export function useAdminHierarchyReport(pagination: ReportPaginationParams) {
  return useQuery({
    queryKey: ["reports", "admin", "hierarchy", pagination],
    queryFn: async () => getReportRows("/reports/admin/hierarchy", pagination)
  });
}

import { ReportPageFrame } from "../../components/ReportPageFrame";
import { useReportPagination } from "../../hooks/useReportPagination";
import { useConstructorStatusCountsReport } from "./hooks";
import { columns, description, icon, title } from "./utils";

export function ConstructorStatusCountsReportPage() {
  const pagination = useReportPagination();
  const report = useConstructorStatusCountsReport({
    page: pagination.page,
    pageSize: pagination.pageSize
  });

  return (
    <ReportPageFrame
      columns={columns}
      description={description}
      error={report.error}
      icon={icon}
      isLoading={report.isLoading}
      pagination={{
        ...pagination,
        reportPagination: report.data?.pagination,
        onPageChange: pagination.setPage,
        onPageSizeChange: pagination.setPageSize
      }}
      rows={report.data?.rows ?? []}
      title={title}
    />
  );
}

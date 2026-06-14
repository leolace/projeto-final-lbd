import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ReportPageFrame } from "../../components/ReportPageFrame";
import { useReportPagination } from "../../hooks/useReportPagination";
import { useAdminAirportsByCityReport } from "./hooks";
import { columns, description, icon, title } from "./utils";

export function AdminAirportsByCityReportPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city") ?? "";
  const [cityInput, setCityInput] = useState(city);
  const pagination = useReportPagination();
  const report = useAdminAirportsByCityReport(city, {
    page: pagination.page,
    pageSize: pagination.pageSize
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("city", cityInput.trim());
      next.set("page", "1");
      return next;
    });
  };

  return (
    <ReportPageFrame
      columns={columns}
      description={description}
      error={city ? report.error : null}
      icon={icon}
      isLoading={city ? report.isLoading : false}
      pagination={{
        ...pagination,
        reportPagination: report.data?.pagination,
        onPageChange: pagination.setPage,
        onPageSizeChange: pagination.setPageSize
      }}
      rows={city ? report.data?.rows ?? [] : []}
      title={title}
    >
      <form
        className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4 sm:flex-row sm:items-end"
        onSubmit={handleSubmit}
      >
        <label className="flex-1 space-y-2">
          <span className="text-sm font-medium text-gray-700">
            Nome da cidade brasileira
          </span>
          <input
            className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-black outline-none transition focus:border-black"
            onChange={(event) => setCityInput(event.target.value)}
            placeholder="São Paulo"
            required
            value={cityInput}
          />
        </label>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800"
          type="submit"
        >
          <Search className="h-4 w-4" />
          Pesquisar
        </button>
      </form>
    </ReportPageFrame>
  );
}

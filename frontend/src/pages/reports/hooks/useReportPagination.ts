import { useSearchParams } from "react-router-dom";

export type ReportPageSize = number | "all";

export const pageSizeOptions: ReportPageSize[] = [10, 20, 50, "all"];
export const defaultPage = 1;
export const defaultPageSize = 20;

function parsePositiveInteger(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function useReportPagination() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPageSizeParam = searchParams.get("pageSize");
  const isAllRows = requestedPageSizeParam === "all";
  const page = isAllRows
    ? defaultPage
    : parsePositiveInteger(searchParams.get("page")) ?? defaultPage;
  const requestedPageSize =
    parsePositiveInteger(requestedPageSizeParam) ?? defaultPageSize;
  const pageSize: ReportPageSize = isAllRows
    ? "all"
    : pageSizeOptions.includes(requestedPageSize)
    ? requestedPageSize
    : defaultPageSize;

  const setPage = (nextPage: number) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set(
        "page",
        String(pageSize === "all" ? defaultPage : Math.max(defaultPage, nextPage))
      );
      next.set("pageSize", String(pageSize));
      return next;
    });
  };

  const setPageSize = (nextPageSize: ReportPageSize) => {
    const validPageSize = pageSizeOptions.includes(nextPageSize)
      ? nextPageSize
      : defaultPageSize;

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("page", String(defaultPage));
      next.set("pageSize", String(validPageSize));
      return next;
    });
  };

  return {
    page,
    pageSize,
    pageSizeOptions,
    setPage,
    setPageSize
  };
}

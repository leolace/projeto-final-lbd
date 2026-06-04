import type { Request } from "express";

export const pageSizeOptions = [10, 20, 50] as const;
export const allPageSize = "all";
export const defaultPage = 1;
export const defaultPageSize = 20;

export type PaginationInput = {
  page: number;
  pageSize: number | typeof allPageSize;
};

export type PaginationMeta = PaginationInput & {
  total: number;
  totalPages: number;
};

type CountedRow = {
  total_count?: string | number;
};

function parsePositiveInteger(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function getPaginationFromRequest(request: Request): PaginationInput {
  const page = parsePositiveInteger(request.query.page) ?? defaultPage;

  if (request.query.pageSize === allPageSize) {
    return { page: defaultPage, pageSize: allPageSize };
  }

  const requestedPageSize =
    parsePositiveInteger(request.query.pageSize) ?? defaultPageSize;
  const pageSize = pageSizeOptions.includes(
    requestedPageSize as (typeof pageSizeOptions)[number]
  )
    ? requestedPageSize
    : defaultPageSize;

  return { page, pageSize };
}

export function getOffset({ page, pageSize }: PaginationInput) {
  if (pageSize === allPageSize) {
    return 0;
  }

  return (page - 1) * pageSize;
}

export function getLimit({ pageSize }: PaginationInput) {
  return pageSize === allPageSize ? null : pageSize;
}

export function createPaginationMeta(
  pagination: PaginationInput,
  total: number
): PaginationMeta {
  return {
    ...pagination,
    total,
    totalPages:
      pagination.pageSize === allPageSize
        ? 1
        : Math.max(1, Math.ceil(total / pagination.pageSize))
  };
}

export function getTotalFromRows(rows: CountedRow[]) {
  const total = rows[0]?.total_count ?? 0;

  return Number(total);
}

export function stripTotalCount<T extends CountedRow>(rows: T[]) {
  return rows.map(({ total_count: _totalCount, ...row }) => row);
}

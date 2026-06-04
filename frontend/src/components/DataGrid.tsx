import {
  flexRender,
  getSortedRowModel,
  getCoreRowModel,
  useReactTable,
  type SortingFn,
  type SortingState,
  type ColumnDef
} from "@tanstack/react-table";
import dayjs from "dayjs";
import { ArrowDown, ArrowUp, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

type RowData = Record<string, unknown>;
type DataGridPageSize = number | "all";

export type DataGridColumn<TRow extends RowData = RowData> = {
  key: Extract<keyof TRow, string> | string;
  header?: ReactNode;
  cell?: (value: unknown, row: TRow) => ReactNode;
  format?: "date" | "datetime" | "number" | "text";
  align?: "left" | "center" | "right";
  className?: string;
  headerClassName?: string;
  hidden?: boolean;
  enableSorting?: boolean;
};

type DataGridProps<TRow extends RowData = RowData> = {
  rows: TRow[];
  columns?: DataGridColumn<TRow>[];
  includeUnconfiguredColumns?: boolean;
  pagination?: {
    page: number;
    pageSize: DataGridPageSize;
    total: number;
    totalPages: number;
    pageSizeOptions: DataGridPageSize[];
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: DataGridPageSize) => void;
  };
};

function formatHeader(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCellValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 2
    }).format(value);
  }

  if (typeof value === "boolean") {
    return value ? "Sim" : "Não";
  }

  if (typeof value === "string" && isDateLike(value)) {
    return formatDate(value);
  }

  return String(value);
}

function isDateLike(value: string) {
  return /^\d{4}-\d{2}-\d{2}(?:T|\s|$)/.test(value) && dayjs(value).isValid();
}

function formatDate(value: string, format: "date" | "datetime" = "date") {
  const date = dayjs(value);

  if (!date.isValid()) {
    return value;
  }

  return date.format(format === "datetime" ? "DD/MM/YYYY HH:mm" : "DD/MM/YYYY");
}

function formatByColumn<TRow extends RowData>(
  value: unknown,
  column: DataGridColumn<TRow>
) {
  if (column.format === "date" || column.format === "datetime") {
    return typeof value === "string" ? formatDate(value, column.format) : "-";
  }

  if (column.format === "number") {
    return typeof value === "number"
      ? new Intl.NumberFormat("pt-BR", {
          maximumFractionDigits: 2
        }).format(value)
      : formatCellValue(value);
  }

  return formatCellValue(value);
}

function createDataGridSortingFn<TRow extends RowData>(): SortingFn<TRow> {
  return (rowA, rowB, columnId) => {
    const a = rowA.original[columnId];
    const b = rowB.original[columnId];

    if (a === b) {
      return 0;
    }

    if (a === null || a === undefined || a === "") {
      return -1;
    }

    if (b === null || b === undefined || b === "") {
      return 1;
    }

    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }

    if (
      typeof a === "string" &&
      typeof b === "string" &&
      isDateLike(a) &&
      isDateLike(b)
    ) {
      return dayjs(a).valueOf() - dayjs(b).valueOf();
    }

    return String(a).localeCompare(String(b), "pt-BR", {
      numeric: true,
      sensitivity: "base"
    });
  };
}

function getAlignClass(align: DataGridColumn["align"]) {
  if (align === "center") {
    return "text-center";
  }

  if (align === "right") {
    return "text-right";
  }

  return "text-left";
}

function createColumnDef<TRow extends RowData>(
  column: DataGridColumn<TRow>
): ColumnDef<TRow> {
  const alignClass = getAlignClass(column.align);

  return {
    accessorKey: column.key,
    enableSorting: column.enableSorting ?? true,
    sortingFn: createDataGridSortingFn<TRow>(),
    header: ({ column: tableColumn }) => {
      const sorted = tableColumn.getIsSorted();
      const SortIcon =
        sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

      return (
        <button
          className={`${alignClass} flex w-full items-center gap-2 ${column.align === "right" ? "justify-end" : column.align === "center" ? "justify-center" : "justify-start"} ${column.headerClassName ?? ""}`}
          disabled={!tableColumn.getCanSort()}
          onClick={tableColumn.getToggleSortingHandler()}
          type="button"
        >
          <span>{column.header ?? formatHeader(column.key)}</span>
          {tableColumn.getCanSort() ? <SortIcon className="h-3.5 w-3.5" /> : null}
        </button>
      );
    },
    cell: ({ getValue, row }) => (
      <span className={`${alignClass} block ${column.className ?? ""}`}>
        {column.cell
          ? column.cell(getValue(), row.original)
          : formatByColumn(getValue(), column)}
      </span>
    )
  };
}

export function DataGrid<TRow extends RowData = RowData>({
  rows,
  columns: configuredColumns,
  includeUnconfiguredColumns = true,
  pagination
}: DataGridProps<TRow>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const columns = useMemo<ColumnDef<TRow>[]>(() => {
    const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
    const configuredKeys = new Set(
      configuredColumns?.map((column) => column.key) ?? []
    );
    const visibleConfiguredColumns =
      configuredColumns?.filter((column) => !column.hidden) ?? [];
    const inferredColumns =
      includeUnconfiguredColumns || !configuredColumns
        ? keys
            .filter((key) => !configuredKeys.has(key))
            .map<DataGridColumn<TRow>>((key) => ({ key }))
        : [];

    return [...visibleConfiguredColumns, ...inferredColumns].map((column) =>
      createColumnDef(column)
    );
  }, [configuredColumns, includeUnconfiguredColumns, rows]);

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  if (rows.length === 0) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-600">
          Nenhum registro encontrado.
        </div>
        {pagination ? <PaginationControls pagination={pagination} /> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-gray-300">
        <div className="max-h-[800px] overflow-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      className="border-b border-gray-300 px-4 py-3 font-semibold"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {table.getRowModel().rows.map((row) => (
                <tr className="hover:bg-gray-50" key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      className="whitespace-nowrap px-4 py-3 text-black"
                      key={cell.id}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {pagination ? <PaginationControls pagination={pagination} /> : null}
    </div>
  );
}

function PaginationControls({
  pagination
}: {
  pagination: NonNullable<DataGridProps["pagination"]>;
}) {
  const isAllRows = pagination.pageSize === "all";
  const numericPageSize =
    typeof pagination.pageSize === "number" ? pagination.pageSize : 0;
  const canGoPrevious = !isAllRows && pagination.page > 1;
  const canGoNext = !isAllRows && pagination.page < pagination.totalPages;
  const firstItem =
    pagination.total === 0
      ? 0
      : isAllRows
      ? 1
      : (pagination.page - 1) * numericPageSize + 1;
  const lastItem = isAllRows
    ? pagination.total
    : Math.min(pagination.page * numericPageSize, pagination.total);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black sm:flex-row sm:items-center sm:justify-between">
      <p>
        {firstItem}-{lastItem} de {pagination.total} registros
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-gray-600">
          Linhas
          <select
            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-black outline-none focus:border-black"
            onChange={(event) => {
              const value = event.target.value;
              pagination.onPageSizeChange(
                value === "all" ? "all" : Number(value)
              );
            }}
            value={pagination.pageSize}
          >
            {pagination.pageSizeOptions.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize === "all" ? "Todos" : pageSize}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-black transition hover:border-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoPrevious}
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <span className="min-w-28 text-center text-gray-600">
            {isAllRows
              ? "Todos os registros"
              : `Página ${pagination.page} de ${pagination.totalPages}`}
          </span>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-black transition hover:border-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoNext}
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            type="button"
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

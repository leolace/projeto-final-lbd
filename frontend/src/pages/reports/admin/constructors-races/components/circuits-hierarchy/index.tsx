import dayjs from "dayjs";
import { ChevronLeft, ChevronRight, CircleDot, Flag } from "lucide-react";
import { useEffect, useState } from "react";
import type {
  CircuitHierarchyItem,
  RaceHierarchyItem
} from "../../../../../../types";

type CircuitsHierarchyProps = {
  circuits: CircuitHierarchyItem[];
};

type PageSize = 10 | 20 | 50 | "all";

const pageSizeOptions: PageSize[] = [10, 20, 50, "all"];

const numberFormatter = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2
});

export function CircuitsHierarchy({ circuits }: CircuitsHierarchyProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(10);
  const [expandedCircuits, setExpandedCircuits] = useState<Set<number>>(
    () => new Set()
  );
  const [expandedRaces, setExpandedRaces] = useState<Set<number>>(
    () => new Set()
  );

  const totalPages =
    pageSize === "all" ? 1 : Math.max(1, Math.ceil(circuits.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleCircuits =
    pageSize === "all"
      ? circuits
      : circuits.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      setExpandedCircuits(new Set());
      setExpandedRaces(new Set());
    }
  }, [page, totalPages]);

  if (circuits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center text-sm text-gray-600">
        Nenhum circuito cadastrado.
      </div>
    );
  }

  const toggleCircuit = (circuitId: number) => {
    setExpandedCircuits((current) => toggleSetItem(current, circuitId));
  };

  const toggleRace = (raceId: number) => {
    setExpandedRaces((current) => toggleSetItem(current, raceId));
  };

  const changePage = (nextPage: number) => {
    setPage(Math.min(Math.max(1, nextPage), totalPages));
    setExpandedCircuits(new Set());
    setExpandedRaces(new Set());
  };

  const changePageSize = (nextPageSize: PageSize) => {
    setPageSize(nextPageSize);
    setPage(1);
    setExpandedCircuits(new Set());
    setExpandedRaces(new Set());
  };

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-gray-300">
        <div className="max-h-[800px] overflow-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-sm">
            <thead className="sticky top-0 z-10 bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
              <tr>
                <HeaderCell>Circuito</HeaderCell>
                <HeaderCell align="right">Quantidade de corridas</HeaderCell>
                <HeaderCell align="right">Mínimo de voltas</HeaderCell>
                <HeaderCell align="right">Média de voltas</HeaderCell>
                <HeaderCell align="right">Máximo de voltas</HeaderCell>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {visibleCircuits.map((circuit) => {
                const canExpand = circuit.races.length > 0;
                const isExpanded = expandedCircuits.has(circuit.circuitId);
                const racesTableId = `circuit-${circuit.circuitId}-races`;

                return (
                  <CircuitRows
                    circuit={circuit}
                    expandedRaces={expandedRaces}
                    isExpanded={isExpanded}
                    key={circuit.circuitId}
                    onToggleCircuit={
                      canExpand
                        ? () => toggleCircuit(circuit.circuitId)
                        : undefined
                    }
                    onToggleRace={toggleRace}
                    racesTableId={racesTableId}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationControls
        onPageChange={changePage}
        onPageSizeChange={changePageSize}
        page={currentPage}
        pageSize={pageSize}
        total={circuits.length}
        totalPages={totalPages}
      />
    </div>
  );
}

function PaginationControls({
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  total,
  totalPages
}: {
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: PageSize) => void;
  page: number;
  pageSize: PageSize;
  total: number;
  totalPages: number;
}) {
  const isAllRows = pageSize === "all";
  const numericPageSize = typeof pageSize === "number" ? pageSize : total;
  const firstItem = total === 0 ? 0 : isAllRows ? 1 : (page - 1) * numericPageSize + 1;
  const lastItem = isAllRows ? total : Math.min(page * numericPageSize, total);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-black sm:flex-row sm:items-center sm:justify-between">
      <p>
        {firstItem}-{lastItem} de {total} registros
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-gray-600">
          Linhas
          <select
            aria-label="Quantidade de circuitos por página"
            className="h-9 rounded-md border border-gray-300 bg-white px-2 text-black outline-none focus:border-black"
            onChange={(event) => {
              const value = event.target.value;
              onPageSizeChange(value === "all" ? "all" : parsePageSize(value));
            }}
            value={pageSize}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option === "all" ? "Todos" : option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-black transition hover:border-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isAllRows || page <= 1}
            onClick={() => onPageChange(page - 1)}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
          <span className="min-w-28 text-center text-gray-600">
            {isAllRows ? "Todos os registros" : `Página ${page} de ${totalPages}`}
          </span>
          <button
            className="inline-flex h-9 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-black transition hover:border-black hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isAllRows || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
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

function CircuitRows({
  circuit,
  expandedRaces,
  isExpanded,
  onToggleCircuit,
  onToggleRace,
  racesTableId
}: {
  circuit: CircuitHierarchyItem;
  expandedRaces: Set<number>;
  isExpanded: boolean;
  onToggleCircuit?: () => void;
  onToggleRace: (raceId: number) => void;
  racesTableId: string;
}) {
  return (
    <>
      <tr className="bg-gray-50 font-medium hover:bg-gray-100">
        <BodyCell>
          <div className="flex items-center gap-2">
            {onToggleCircuit ? (
              <ExpandButton
                controls={racesTableId}
                expanded={isExpanded}
                label={`${isExpanded ? "Recolher" : "Expandir"} corridas de ${circuit.circuitName}`}
                onClick={onToggleCircuit}
              />
            ) : (
              <span className="h-7 w-7" />
            )}
            <Flag className="h-4 w-4 shrink-0 text-gray-600" />
            <span>{circuit.circuitName}</span>
          </div>
        </BodyCell>
        <NumberCell value={circuit.racesCount} />
        <NumberCell value={circuit.minLaps} />
        <NumberCell value={circuit.avgLaps} />
        <NumberCell value={circuit.maxLaps} />
      </tr>

      {isExpanded ? (
        <tr>
          <td className="bg-gray-100/70 p-4" colSpan={5}>
            <RacesTable
              expandedRaces={expandedRaces}
              id={racesTableId}
              onToggleRace={onToggleRace}
              races={circuit.races}
            />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RacesTable({
  expandedRaces,
  id,
  onToggleRace,
  races
}: {
  expandedRaces: Set<number>;
  id: string;
  onToggleRace: (raceId: number) => void;
  races: RaceHierarchyItem[];
}) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
      <div className="w-full overflow-x-auto">
        <table
          className="w-full min-w-[620px] border-collapse text-left text-sm"
          id={id}
        >
          <thead className="bg-gray-200 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <HeaderCell>Corrida</HeaderCell>
              <HeaderCell align="right">Temporada</HeaderCell>
              <HeaderCell>Data</HeaderCell>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {races.map((race) => (
              <RaceRows
                isExpanded={expandedRaces.has(race.raceId)}
                key={race.raceId}
                onToggle={() => onToggleRace(race.raceId)}
                race={race}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RaceRows({
  isExpanded,
  onToggle,
  race
}: {
  isExpanded: boolean;
  onToggle: () => void;
  race: RaceHierarchyItem;
}) {
  const detailsTableId = `race-${race.raceId}-details`;

  return (
    <>
      <tr className="hover:bg-gray-50">
        <BodyCell>
          <div className="flex items-center gap-2">
            <ExpandButton
              controls={detailsTableId}
              expanded={isExpanded}
              label={`${isExpanded ? "Recolher" : "Expandir"} detalhes de ${race.raceName}`}
              onClick={onToggle}
            />
            <CircleDot className="h-3.5 w-3.5 shrink-0 text-gray-500" />
            <span>{race.raceName}</span>
          </div>
        </BodyCell>
        <NumberCell value={race.seasonYear} />
        <BodyCell>{formatDate(race.raceDate)}</BodyCell>
      </tr>

      {isExpanded ? (
        <tr>
          <td className="bg-gray-50 p-4" colSpan={3}>
            <RaceDetailsTable id={detailsTableId} race={race} />
          </td>
        </tr>
      ) : null}
    </>
  );
}

function RaceDetailsTable({
  id,
  race
}: {
  id: string;
  race: RaceHierarchyItem;
}) {
  return (
    <div className="w-full overflow-hidden rounded-md border border-gray-300 bg-white">
      <table className="w-full border-collapse text-sm" id={id}>
        <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600">
          <tr>
            <HeaderCell align="right">Voltas registradas</HeaderCell>
            <HeaderCell align="right">Pilotos participantes</HeaderCell>
          </tr>
        </thead>
        <tbody>
          <tr>
            <NumberCell value={race.lapsCount} />
            <NumberCell value={race.driversCount} />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function ExpandButton({
  controls,
  expanded,
  label,
  onClick
}: {
  controls: string;
  expanded: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-controls={controls}
      aria-expanded={expanded}
      aria-label={label}
      className="grid h-7 w-7 shrink-0 place-items-center rounded border border-transparent transition hover:border-gray-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1"
      onClick={onClick}
      type="button"
    >
      <ChevronRight
        className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
      />
    </button>
  );
}

function HeaderCell({
  align = "left",
  children
}: {
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <th
      className={`whitespace-nowrap border-b border-gray-300 px-4 py-3 font-semibold ${
        align === "right" ? "text-right" : "text-left"
      }`}
      scope="col"
    >
      {children}
    </th>
  );
}

function BodyCell({ children }: { children: React.ReactNode }) {
  return <td className="whitespace-nowrap px-4 py-3 text-black">{children}</td>;
}

function NumberCell({ value }: { value: number }) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-right text-black">
      {numberFormatter.format(value)}
    </td>
  );
}

function formatDate(value: string) {
  const date = dayjs(value);

  return date.isValid() ? date.format("DD/MM/YYYY") : value;
}

function parsePageSize(value: string): Exclude<PageSize, "all"> {
  const parsed = Number(value);

  return parsed === 10 || parsed === 20 || parsed === 50 ? parsed : 10;
}

function toggleSetItem(current: Set<number>, item: number) {
  const next = new Set(current);

  if (next.has(item)) {
    next.delete(item);
  } else {
    next.add(item);
  }

  return next;
}

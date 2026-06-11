import { CalendarDays, Flag, Trophy } from "lucide-react";
import { DataGrid, type DataGridColumn } from "../../../../components/DataGrid";
import { MetricCard } from "../../components/metric-card";
import type {
  DriverDashboardSummary,
  DriverDashboardYearCircuitStat
} from "../../../../types";

type DriverDashboardPageProps = {
  summary: DriverDashboardSummary;
};

const yearCircuitColumns: DataGridColumn<DriverDashboardYearCircuitStat>[] = [
  { key: "seasonYear", header: "Ano", align: "right", format: "number" },
  { key: "circuitName", header: "Circuito" },
  { key: "totalPoints", header: "Pontos", align: "right", format: "number" },
  { key: "winsCount", header: "Vitórias", align: "right", format: "number" },
  { key: "racesCount", header: "Corridas", align: "right", format: "number" }
];

export function DriverDashboardPage({ summary }: DriverDashboardPageProps) {
  const resultsPeriod =
    summary.firstResultsYear && summary.lastResultsYear
      ? `${summary.firstResultsYear} - ${summary.lastResultsYear}`
      : "Sem resultados";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard icon={Trophy} label="Piloto" value={summary.driverName} />
        <MetricCard
          icon={Flag}
          label="Escuderia associada"
          value={summary.constructorName ?? "Sem escuderia"}
        />
        <MetricCard
          icon={CalendarDays}
          label="Período na base"
          value={resultsPeriod}
        />
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Desempenho por circuito</h3>
          <p className="mt-1 text-sm text-gray-600">
            Totais agrupados por ano e circuito.
          </p>
        </div>
        <DataGrid
          columns={yearCircuitColumns}
          includeUnconfiguredColumns={false}
          rows={summary.yearCircuitStats}
        />
      </section>
    </div>
  );
}

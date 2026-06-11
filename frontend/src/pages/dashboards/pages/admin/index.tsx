import { CalendarDays, Flag, Trophy } from "lucide-react";
import type { ReactNode } from "react";
import { DataGrid, type DataGridColumn } from "../../../../components/DataGrid";
import type {
  AdminDashboardConstructor,
  AdminDashboardDriver,
  AdminDashboardRace,
  AdminDashboardSummary,
  Season,
} from "../../../../types";
import { MetricCard } from "../../components/metric-card";
import { SeasonsSelect } from "../../components/seasons-select";

type AdminDashboardPageProps = {
  summary: AdminDashboardSummary;
};

const raceColumns: DataGridColumn<AdminDashboardRace>[] = [
  { key: "raceName", header: "Corrida" },
  { key: "circuitName", header: "Circuito" },
  { key: "raceDate", header: "Data", format: "date" },
  {
    key: "raceTime",
    header: "Horário",
    cell: (value) => formatRaceTime(value),
  },
  { key: "lapsCount", header: "Voltas", align: "right", format: "number" },
];

const constructorColumns: DataGridColumn<AdminDashboardConstructor>[] = [
  { key: "constructorName", header: "Escuderia" },
  { key: "totalPoints", header: "Pontos", align: "right", format: "number" },
];

const driverColumns: DataGridColumn<AdminDashboardDriver>[] = [
  { key: "driverName", header: "Piloto" },
  { key: "totalPoints", header: "Pontos", align: "right", format: "number" },
];

export function AdminDashboardPage({ summary }: AdminDashboardPageProps) {
  const selectedSeasonLabel = summary.selectedSeason
    ? `Temporada ${summary.selectedSeason.year}`
    : "Sem temporada cadastrada";

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={Trophy}
          label="Pilotos"
          value={summary.driversCount}
        />
        <MetricCard
          icon={Flag}
          label="Escuderias"
          value={summary.constructorsCount}
        />
        <MetricCard
          icon={CalendarDays}
          label="Temporadas"
          value={summary.seasonsCount}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-gray-300 bg-gray-50 p-4 sm:flex-row sm:items-end sm:justify-between">
        <SeasonsSelect />
      </div>

      <DashboardDataSection
        description={selectedSeasonLabel}
        title="Corridas cadastradas"
      >
        <DataGrid
          columns={raceColumns}
          includeUnconfiguredColumns={false}
          rows={summary.latestSeasonRaces}
        />
      </DashboardDataSection>

      <DashboardDataSection
        description={selectedSeasonLabel}
        title="Pontos por escuderia"
      >
        <DataGrid
          columns={constructorColumns}
          includeUnconfiguredColumns={false}
          rows={summary.latestSeasonConstructors}
        />
      </DashboardDataSection>

      <DashboardDataSection
        description={selectedSeasonLabel}
        title="Pontos por piloto"
      >
        <DataGrid
          columns={driverColumns}
          includeUnconfiguredColumns={false}
          rows={summary.latestSeasonDrivers}
        />
      </DashboardDataSection>
    </div>
  );
}

function DashboardDataSection({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function formatRaceTime(value: unknown) {
  if (typeof value !== "string" || value.length === 0) {
    return "-";
  }

  return value.slice(0, 5);
}

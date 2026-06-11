import { CalendarDays, Flag, Trophy, Users } from "lucide-react";
import { MetricCard } from "../../components/metric-card";
import type { ConstructorDashboardSummary } from "../../../../types";

type ConstructorDashboardPageProps = {
  summary: ConstructorDashboardSummary;
};

export function ConstructorDashboardPage({
  summary
}: ConstructorDashboardPageProps) {
  const resultsPeriod =
    summary.firstResultsYear && summary.lastResultsYear
      ? `${summary.firstResultsYear} - ${summary.lastResultsYear}`
      : "Sem resultados";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        icon={Flag}
        label="Escuderia"
        value={summary.constructorName}
      />
      <MetricCard
        icon={Trophy}
        label="Vitórias"
        value={summary.winsCount}
      />
      <MetricCard
        icon={Users}
        label="Pilotos diferentes"
        value={summary.associatedDriversCount}
      />
      <MetricCard
        icon={CalendarDays}
        label="Período na base"
        value={resultsPeriod}
      />
    </div>
  );
}

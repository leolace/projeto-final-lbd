import { Flag, Users } from "lucide-react";
import { MetricCard } from "../../components/metric-card";
import type { ConstructorDashboardSummary } from "../../../../types";

type ConstructorDashboardPageProps = {
  summary: ConstructorDashboardSummary;
};

export function ConstructorDashboardPage({
  summary
}: ConstructorDashboardPageProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricCard
        icon={Flag}
        label="Escuderia"
        value={summary.constructorName}
      />
      <MetricCard
        icon={Users}
        label="Pilotos associados"
        value={summary.associatedDriversCount}
      />
    </div>
  );
}

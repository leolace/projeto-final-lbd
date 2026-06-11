import { Flag, Trophy } from "lucide-react";
import { MetricCard } from "../../components/metric-card";
import type { DriverDashboardSummary } from "../../../../types";

type DriverDashboardPageProps = {
  summary: DriverDashboardSummary;
};

export function DriverDashboardPage({ summary }: DriverDashboardPageProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricCard icon={Trophy} label="Piloto" value={summary.driverName} />
      <MetricCard
        icon={Flag}
        label="Escuderia associada"
        value={summary.constructorName ?? "Sem escuderia"}
      />
    </div>
  );
}

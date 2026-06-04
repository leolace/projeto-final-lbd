import { BarChart3, Flag, Gauge, Trophy, type LucideIcon } from "lucide-react";

export const title = "Resumo de desempenho";
export const description = "Pontos, corridas, vitórias e melhor posição.";
export const icon = BarChart3;

export type PerformanceMetric = {
  icon: LucideIcon;
  key: string;
  label: string;
};

export const metrics: PerformanceMetric[] = [
  { key: "races_count", label: "Corridas", icon: Gauge },
  { key: "total_points", label: "Pontos", icon: BarChart3 },
  { key: "best_position", label: "Melhor posição", icon: Flag },
  { key: "wins", label: "Vitórias", icon: Trophy }
];

export function formatMetricValue(value: unknown) {
  if (typeof value === "number") {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 2
    }).format(value);
  }

  if (typeof value === "string" && value !== "") {
    return value;
  }

  return "0";
}

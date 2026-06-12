import { BarChart3 } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Pontos por ano";
export const description =
  "Pontos obtidos por ano e corridas em que o piloto autenticado pontuou.";
export const icon = BarChart3;

export const columns: DataGridColumn[] = [
  { key: "season_year", header: "Ano", align: "right", format: "number" },
  {
    key: "total_points_year",
    header: "Total no ano",
    align: "right",
    format: "number"
  },
  { key: "race_date", header: "Data", format: "date" },
  { key: "race_name", header: "Corrida" },
  { key: "circuit_name", header: "Circuito" },
  {
    key: "race_points",
    header: "Pontos na corrida",
    align: "right",
    format: "number"
  }
];

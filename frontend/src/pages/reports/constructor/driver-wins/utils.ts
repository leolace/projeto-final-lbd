import { Trophy } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Vitórias por piloto";
export const description =
  "Pilotos que correram pela escuderia e quantidade de primeiras posições.";
export const icon = Trophy;

export const columns: DataGridColumn[] = [
  { key: "driver_name", header: "Piloto" },
  {
    key: "wins_count",
    header: "Vitórias",
    align: "right",
    format: "number"
  }
];

import { ClipboardList } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Resultados por corrida";
export const description = "Resultados dos pilotos da escuderia.";
export const icon = ClipboardList;

export const columns: DataGridColumn[] = [
  { key: "race_date", header: "Data", format: "date" },
  { key: "race_name", header: "Corrida" },
  { key: "driver_name", header: "Piloto" },
  { key: "position_order", header: "Posição", align: "right" },
  { key: "points", header: "Pontos", align: "right" },
  { key: "laps", header: "Voltas", align: "right" }
];

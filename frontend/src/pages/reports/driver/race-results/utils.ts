import { ClipboardList } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Corridas do piloto";
export const description = "Resultados por corrida do piloto.";
export const icon = ClipboardList;

export const columns: DataGridColumn[] = [
  { key: "race_date", header: "Data", format: "date" },
  { key: "race_name", header: "Corrida" },
  { key: "constructor_name", header: "Escuderia" },
  { key: "grid", header: "Grid", align: "right" },
  { key: "position_order", header: "Posição", align: "right" },
  { key: "points", header: "Pontos", align: "right" },
  { key: "laps", header: "Voltas", align: "right" }
];

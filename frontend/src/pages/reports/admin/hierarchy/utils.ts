import { ListChecks } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Escuderias e corridas";
export const description =
  "Relatório hierárquico com escuderias, totais de corridas, circuitos e corridas por circuito.";
export const icon = ListChecks;

export const columns: DataGridColumn[] = [
  { key: "level", header: "Nível" },
  { key: "constructor_name", header: "Escuderia" },
  {
    key: "drivers_count",
    header: "Pilotos",
    align: "right",
    format: "number"
  },
  {
    key: "races_count",
    header: "Corridas",
    align: "right",
    format: "number"
  },
  { key: "circuit_name", header: "Circuito" },
  { key: "min_laps", header: "Mín. voltas", align: "right", format: "number" },
  {
    key: "average_laps",
    header: "Média voltas",
    align: "right",
    format: "number"
  },
  { key: "max_laps", header: "Máx. voltas", align: "right", format: "number" },
  { key: "race_name", header: "Corrida" },
  {
    key: "registered_laps",
    header: "Voltas registradas",
    align: "right",
    format: "number"
  },
  {
    key: "participants_count",
    header: "Pilotos participantes",
    align: "right",
    format: "number"
  }
];

import { ListChecks } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Status do piloto";
export const description =
  "Quantidade de resultados por status nas corridas do piloto autenticado.";
export const icon = ListChecks;

export const columns: DataGridColumn[] = [
  { key: "status_name", header: "Status" },
  {
    key: "results_count",
    header: "Quantidade de resultados",
    align: "right",
    format: "number"
  }
];

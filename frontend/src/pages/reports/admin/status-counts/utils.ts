import { ListChecks } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Resultados por status";
export const description =
  "Quantidade de resultados cadastrados para cada status da base.";
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

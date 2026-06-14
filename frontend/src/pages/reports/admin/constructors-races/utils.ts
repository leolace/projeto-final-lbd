import { Network } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";
import type { ConstructorReportItem } from "../../../../types";

export const title = "Escuderias e corridas por circuito";
export const description =
  "Quantidade de pilotos por escuderia e relatório hierárquico das corridas cadastradas em cada circuito.";
export const icon = Network;

export const constructorColumns: DataGridColumn<ConstructorReportItem>[] = [
  { key: "constructorName", header: "Escuderia" },
  {
    key: "driversCount",
    header: "Quantidade de pilotos",
    align: "right",
    format: "number"
  }
];

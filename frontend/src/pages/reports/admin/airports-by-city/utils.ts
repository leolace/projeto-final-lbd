import { Plane } from "lucide-react";
import type { DataGridColumn } from "../../../../components/DataGrid";

export const title = "Aeroportos por cidade";
export const description =
  "Aeroportos brasileiros médios ou grandes a até 100 km de cidades brasileiras com o nome pesquisado.";
export const icon = Plane;

export const columns: DataGridColumn[] = [
  { key: "searched_city_name", header: "Cidade pesquisada" },
  { key: "iata_code", header: "IATA" },
  { key: "airport_name", header: "Aeroporto" },
  { key: "airport_city_name", header: "Cidade do aeroporto" },
  {
    key: "distance_km",
    header: "Distância (km)",
    align: "right",
    format: "number"
  },
  { key: "airport_type", header: "Tipo" }
];

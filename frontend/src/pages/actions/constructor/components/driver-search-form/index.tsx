import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../../../../../api";
import { DataGrid, type DataGridColumn } from "../../../../../components/DataGrid";
import { FormField } from "../../../../../components/form-field";
import { FormInput } from "../../../../../components/form-input";
import {
  StatusMessage,
  type StatusMessageStatus
} from "../../../../../components/status-message";
import type { ConstructorDriverSearchResult } from "../../../../../types";
import { useSearchConstructorDriversAction } from "../../../hooks";

type DriverSearchRow = ConstructorDriverSearchResult & {
  countryLabel: string;
};

const searchColumns: DataGridColumn<DriverSearchRow>[] = [
  { key: "fullName", header: "Nome completo" },
  { key: "dateOfBirth", header: "Nascimento", format: "date" },
  { key: "countryLabel", header: "País / Nacionalidade" }
];

const buttonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600";

export function DriverSearchForm() {
  const mutation = useSearchConstructorDriversAction();
  const [familyName, setFamilyName] = useState("");
  const [rows, setRows] = useState<DriverSearchRow[]>([]);
  const [status, setStatus] = useState<StatusMessageStatus | null>(null);
  const hasSearched = mutation.isSuccess;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setRows([]);

    try {
      const result = await mutation.mutateAsync(familyName);
      const mappedRows = result.drivers.map((driver) => ({
        ...driver,
        countryLabel: driver.countryName
          ? `${driver.countryName} (${driver.nationality})`
          : driver.nationality
      }));

      setRows(mappedRows);

      if (mappedRows.length === 0) {
        setStatus({
          tone: "success",
          message: "Nenhum piloto encontrado para esta escuderia."
        });
      }
    } catch (error) {
      setStatus({
        tone: "error",
        message: getApiErrorMessage(error)
      });
    }
  };

  return (
    <section className="space-y-5 rounded-lg border border-gray-300 bg-gray-50 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white text-black">
          <Search className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-semibold">Consultar piloto por sobrenome</h3>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField label="Sobrenome">
          <FormInput
            onValueChange={setFamilyName}
            required
            value={familyName}
          />
        </FormField>
        <StatusMessage status={status} />
        <button
          className={buttonClassName}
          disabled={mutation.isPending}
          type="submit"
        >
          <Search className="h-4 w-4" />
          {mutation.isPending ? "Consultando..." : "Consultar piloto"}
        </button>
      </form>

      {rows.length > 0 ? (
        <DataGrid
          columns={searchColumns}
          includeUnconfiguredColumns={false}
          rows={rows}
        />
      ) : null}

      {hasSearched && rows.length === 0 && !status ? (
        <div className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600">
          Nenhum resultado para exibir.
        </div>
      ) : null}
    </section>
  );
}

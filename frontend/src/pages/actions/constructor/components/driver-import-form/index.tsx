import { FileUp, Upload } from "lucide-react";
import { SubmitEvent, useState } from "react";
import { getApiErrorMessage } from "../../../../../api";
import { FormField } from "../../../../../components/form-field";
import { useImportConstructorDriversAction } from "../../../hooks";
import { StatusMessage, StatusMessageStatus } from "@/components/status-message";

const fileInputClassName =
  "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-black hover:file:bg-gray-200";

const buttonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black bg-black px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:text-gray-600";

export function DriverImportForm() {
  const mutation = useImportConstructorDriversAction();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<StatusMessageStatus | null>(null);

  const handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault();
    setStatus(null);

    if (!file) {
      setStatus({
        tone: "error",
        message: "Selecione um arquivo para importar."
      });
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        content: await file.text(),
        fileName: file.name
      });

      setFile(null);
      event.target.reset();
      setStatus({
        tone: "success",
        message: `${result.insertedCount} piloto(s) importado(s) com sucesso.`
      });
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
          <FileUp className="h-5 w-5" />
        </span>
        <h3 className="text-xl font-semibold">Inserir pilotos por arquivo</h3>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <FormField label="arquivo">
          <input
            accept=".csv,text/csv,text/plain"
            className={fileInputClassName}
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            required
            type="file"
          />
        </FormField>
        <StatusMessage status={status} />
        <button
          className={buttonClassName}
          disabled={mutation.isPending}
          type="submit"
        >
          <Upload className="h-4 w-4" />
          {mutation.isPending ? "Importando..." : "Importar pilotos"}
        </button>
      </form>
    </section>
  );
}

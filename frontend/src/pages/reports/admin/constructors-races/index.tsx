import { ArrowLeft, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../../../api";
import { DataGrid } from "../../../../components/DataGrid";
import { CircuitsHierarchy } from "./components/circuits-hierarchy";
import { useAdminConstructorsRacesReport } from "./hooks";
import {
  constructorColumns,
  description,
  icon as ReportIcon,
  title
} from "./utils";

export function AdminConstructorsRacesReportPage() {
  const report = useAdminConstructorsRacesReport();
  const data = report.data;
  const hasNoData =
    data &&
    data.constructors.length === 0 &&
    data.racesHierarchy.circuits.length === 0;

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <span className="grid h-11 w-11 place-items-center rounded-md border border-gray-300 bg-gray-50 text-black">
            <ReportIcon className="h-5 w-5" />
          </span>
          <p className="mt-5 text-sm font-medium uppercase tracking-wide text-gray-600">
            Relatório
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        </div>

        <Link
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-black transition hover:border-black hover:bg-gray-100"
          to="/reports"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </header>

      {report.isLoading ? <ReportState message="Carregando relatório..." /> : null}

      {report.error ? (
        <ReportState message={getApiErrorMessage(report.error)} />
      ) : null}

      {!report.isLoading && !report.error && hasNoData ? (
        <ReportState message="Nenhum dado cadastrado para este relatório." />
      ) : null}

      {!report.isLoading && !report.error && data && !hasNoData ? (
        <>
          <ReportSection
            description="Pilotos distintos encontrados nos resultados de cada escuderia."
            title="Escuderias cadastradas"
          >
            <DataGrid
              columns={constructorColumns}
              includeUnconfiguredColumns={false}
              rows={data.constructors}
            />
          </ReportSection>

          <article className="rounded-lg border border-gray-300 bg-gray-50 p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white">
                <Flag className="h-5 w-5" />
              </span>
              <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
                Quantidade total de corridas cadastradas
              </p>
            </div>
            <p className="mt-5 text-3xl font-semibold">
              {data.racesHierarchy.totalRaces}
            </p>
          </article>

          <ReportSection
            description="Expanda um circuito para consultar suas estatísticas e corridas."
            title="Corridas por circuito"
          >
            <CircuitsHierarchy circuits={data.racesHierarchy.circuits} />
          </ReportSection>
        </>
      ) : null}
    </section>
  );
}

function ReportSection({
  children,
  description: sectionDescription,
  title: sectionTitle
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{sectionTitle}</h3>
        <p className="mt-1 text-sm text-gray-600">{sectionDescription}</p>
      </div>
      {children}
    </section>
  );
}

function ReportState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
      {message}
    </div>
  );
}

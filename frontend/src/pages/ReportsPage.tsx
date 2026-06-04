import { FileSearch, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { UserType } from "../types";
import {
  description as adminOverviewDescription,
  icon as adminOverviewIcon,
  title as adminOverviewTitle,
} from "./reports/admin/overview/utils";
import {
  description as adminTopConstructorsDescription,
  icon as adminTopConstructorsIcon,
  title as adminTopConstructorsTitle,
} from "./reports/admin/top-constructors/utils";
import {
  description as adminTopDriversDescription,
  icon as adminTopDriversIcon,
  title as adminTopDriversTitle,
} from "./reports/admin/top-drivers/utils";
import {
  description as constructorDriversDescription,
  icon as constructorDriversIcon,
  title as constructorDriversTitle,
} from "./reports/constructor/drivers/utils";
import {
  description as constructorRaceResultsDescription,
  icon as constructorRaceResultsIcon,
  title as constructorRaceResultsTitle,
} from "./reports/constructor/race-results/utils";
import {
  description as driverPerformanceSummaryDescription,
  icon as driverPerformanceSummaryIcon,
  title as driverPerformanceSummaryTitle,
} from "./reports/driver/performance-summary/utils";
import {
  description as driverRaceResultsDescription,
  icon as driverRaceResultsIcon,
  title as driverRaceResultsTitle,
} from "./reports/driver/race-results/utils";

type ReportLink = {
  description: string;
  icon: LucideIcon;
  title: string;
  to: string;
};

function getReportLinks(userType: UserType): ReportLink[] {
  if (userType === UserType.Admin) {
    return [
      {
        description: adminOverviewDescription,
        icon: adminOverviewIcon,
        title: adminOverviewTitle,
        to: "/reports/admin/overview",
      },
      {
        description: adminTopDriversDescription,
        icon: adminTopDriversIcon,
        title: adminTopDriversTitle,
        to: "/reports/admin/top-drivers",
      },
      {
        description: adminTopConstructorsDescription,
        icon: adminTopConstructorsIcon,
        title: adminTopConstructorsTitle,
        to: "/reports/admin/top-constructors",
      },
    ];
  }

  if (userType === UserType.Escuderia) {
    return [
      {
        description: constructorDriversDescription,
        icon: constructorDriversIcon,
        title: constructorDriversTitle,
        to: "/reports/constructor/drivers",
      },
      {
        description: constructorRaceResultsDescription,
        icon: constructorRaceResultsIcon,
        title: constructorRaceResultsTitle,
        to: "/reports/constructor/race-results",
      },
    ];
  }

  return [
    {
      description: driverRaceResultsDescription,
      icon: driverRaceResultsIcon,
      title: driverRaceResultsTitle,
      to: "/reports/driver/race-results",
    },
    {
      description: driverPerformanceSummaryDescription,
      icon: driverPerformanceSummaryIcon,
      title: driverPerformanceSummaryTitle,
      to: "/reports/driver/performance-summary",
    },
  ];
}

export function ReportsPage() {
  const { user } = useAuth();
  const reports = user ? getReportLinks(user.tipo) : [];

  return (
    <section className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
          Relatórios
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Consultar dados</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Selecione um relatório disponível para o perfil autenticado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Link
            className="min-h-36 rounded-lg border border-gray-300 bg-gray-50 p-5 text-left text-black transition hover:border-black hover:bg-white"
            key={report.to}
            to={report.to}
          >
            <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white text-black">
              <report.icon className="h-5 w-5" />
            </span>
            <span className="mt-4 block text-lg font-semibold">
              {report.title}
            </span>
            <span className="mt-2 block text-sm leading-6">
              {report.description}
            </span>
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          <FileSearch className="mx-auto mb-3 h-8 w-8 text-gray-600" />
          Nenhum relatório disponível para este perfil.
        </div>
      ) : null}
    </section>
  );
}

import { FileSearch, type LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { UserType } from "../types";
import {
  description as adminAirportsByCityDescription,
  icon as adminAirportsByCityIcon,
  title as adminAirportsByCityTitle
} from "./reports/admin/airports-by-city/utils";
import {
  description as adminHierarchyDescription,
  icon as adminHierarchyIcon,
  title as adminHierarchyTitle
} from "./reports/admin/hierarchy/utils";
import {
  description as adminStatusCountsDescription,
  icon as adminStatusCountsIcon,
  title as adminStatusCountsTitle
} from "./reports/admin/status-counts/utils";
import {
  description as constructorDriverWinsDescription,
  icon as constructorDriverWinsIcon,
  title as constructorDriverWinsTitle
} from "./reports/constructor/driver-wins/utils";
import {
  description as constructorStatusCountsDescription,
  icon as constructorStatusCountsIcon,
  title as constructorStatusCountsTitle
} from "./reports/constructor/status-counts/utils";
import {
  description as driverStatusCountsDescription,
  icon as driverStatusCountsIcon,
  title as driverStatusCountsTitle
} from "./reports/driver/status-counts/utils";
import {
  description as driverYearPointsDescription,
  icon as driverYearPointsIcon,
  title as driverYearPointsTitle
} from "./reports/driver/year-points/utils";

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
        description: adminStatusCountsDescription,
        icon: adminStatusCountsIcon,
        title: adminStatusCountsTitle,
        to: "/reports/admin/status-counts",
      },
      {
        description: adminAirportsByCityDescription,
        icon: adminAirportsByCityIcon,
        title: adminAirportsByCityTitle,
        to: "/reports/admin/airports-by-city",
      },
      {
        description: adminHierarchyDescription,
        icon: adminHierarchyIcon,
        title: adminHierarchyTitle,
        to: "/reports/admin/hierarchy",
      },
    ];
  }

  if (userType === UserType.Escuderia) {
    return [
      {
        description: constructorDriverWinsDescription,
        icon: constructorDriverWinsIcon,
        title: constructorDriverWinsTitle,
        to: "/reports/constructor/driver-wins",
      },
      {
        description: constructorStatusCountsDescription,
        icon: constructorStatusCountsIcon,
        title: constructorStatusCountsTitle,
        to: "/reports/constructor/status-counts",
      },
    ];
  }

  return [
    {
      description: driverYearPointsDescription,
      icon: driverYearPointsIcon,
      title: driverYearPointsTitle,
      to: "/reports/driver/year-points",
    },
    {
      description: driverStatusCountsDescription,
      icon: driverStatusCountsIcon,
      title: driverStatusCountsTitle,
      to: "/reports/driver/status-counts",
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

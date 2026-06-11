import { BarChart3 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage } from "../../api";
import type { DashboardResponse, Season } from "../../types";
import { UserType } from "../../types";
import { PageState } from "./components/page-state";
import { useDashboard, useSeasons } from "./hooks";
import { AdminDashboardPage } from "./pages/admin";
import { ConstructorDashboardPage } from "./pages/escuderia";
import { DriverDashboardPage } from "./pages/piloto";
import { useDashboardStore } from "./store";
import { useAuth } from "../../auth";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
            Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{user?.name}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Perfil autenticado: <span className="text-black">{user?.tipo}</span>
          </p>
        </div>

        <Link
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-black bg-white px-4 text-sm font-semibold text-black transition hover:bg-gray-100"
          to="/reports"
        >
          <BarChart3 className="h-4 w-4" />
          Abrir relatórios
        </Link>
      </div>

      <Dashboard />
    </section>
  );
}

const Dashboard = () => {
  const season = useDashboardStore((state) => state.season);
  const { data: dashboard, isLoading, error } = useDashboard(season?.id);

  if (isLoading) {
    return <PageState message="Carregando dashboard..." />;
  }

  if (error) {
    return <PageState message={getApiErrorMessage(error)} tone="error" />;
  }

  if (!dashboard) {
    return <PageState message="Dashboard indisponível." tone="error" />;
  }

  if (dashboard.roleLabel === UserType.Admin) {
    return <AdminDashboardPage summary={dashboard.summary} />;
  }

  if (dashboard.roleLabel === UserType.Escuderia) {
    return <ConstructorDashboardPage summary={dashboard.summary} />;
  }

  return <DriverDashboardPage summary={dashboard.summary} />;
};

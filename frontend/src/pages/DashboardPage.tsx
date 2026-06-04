import { useQuery } from "@tanstack/react-query";
import { BarChart3, Flag, Gauge, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { getApiErrorMessage, getDashboard } from "../api";
import { UserType } from "../types";

export function DashboardPage() {
  const dashboard = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard
  });

  if (dashboard.isLoading) {
    return <PageState message="Carregando dashboard..." />;
  }

  if (dashboard.error) {
    return <PageState message={getApiErrorMessage(dashboard.error)} tone="error" />;
  }

  if (!dashboard.data) {
    return <PageState message="Dashboard indisponível." tone="error" />;
  }

  const { user, summary } = dashboard.data;

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-5 border-b border-gray-200 pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
            Dashboard
          </p>
          <h2 className="mt-2 text-3xl font-semibold">{user.name}</h2>
          <p className="mt-2 text-sm text-gray-600">
            Perfil autenticado: <span className="text-black">{user.tipo}</span>
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

      {user.tipo === UserType.Admin ? <AdminSummary summary={summary} /> : null}
      {user.tipo === UserType.Escuderia ? (
        <ConstructorSummary summary={summary} />
      ) : null}
      {user.tipo === UserType.Piloto ? <DriverSummary summary={summary} /> : null}
    </section>
  );
}

function AdminSummary({ summary }: { summary: Record<string, unknown> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard icon={Gauge} label="Admin" value="Administrador" />
      <MetricCard icon={Users} label="Usuários" value={summary.usersCount} />
      <MetricCard icon={Trophy} label="Pilotos" value={summary.driversCount} />
      <MetricCard icon={Flag} label="Escuderias" value={summary.constructorsCount} />
    </div>
  );
}

function ConstructorSummary({ summary }: { summary: Record<string, unknown> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricCard
        icon={Flag}
        label="Escuderia"
        value={summary.constructorName}
      />
      <MetricCard
        icon={Users}
        label="Pilotos associados"
        value={summary.associatedDriversCount}
      />
    </div>
  );
}

function DriverSummary({ summary }: { summary: Record<string, unknown> }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricCard icon={Trophy} label="Piloto" value={summary.driverName} />
      <MetricCard
        icon={Flag}
        label="Escuderia associada"
        value={summary.constructorName ?? "Sem escuderia"}
      />
    </div>
  );
}

type MetricCardProps = {
  icon: typeof Gauge;
  label: string;
  value: unknown;
};

function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
  return (
    <article className="min-h-32 rounded-lg border border-gray-300 bg-gray-50 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 bg-white text-black">
          <Icon className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
          {label}
        </p>
      </div>
      <p className="mt-5 break-words text-2xl font-semibold">
        {String(value ?? "-")}
      </p>
    </article>
  );
}

function PageState({
  message,
  tone = "default"
}: {
  message: string;
  tone?: "default" | "error";
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-8 text-center text-sm ${
        tone === "error"
          ? "border-gray-300 bg-gray-50 text-black"
          : "border-gray-300 bg-gray-50 text-gray-600"
      }`}
    >
      {message}
    </div>
  );
}

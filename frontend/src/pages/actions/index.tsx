import { useAuth } from "../../auth";
import { UserType } from "../../types";
import { AdminActionsPage } from "./admin";
import { ConstructorActionsPage } from "./constructor";
import { DriverActionsPage } from "./driver";

export function ActionsPage() {
  const { user } = useAuth();

  return (
    <section className="space-y-8">
      <PageHeader />
      {user?.tipo === UserType.Admin ? <AdminActionsPage /> : null}
      {user?.tipo === UserType.Escuderia ? <ConstructorActionsPage /> : null}
      {user?.tipo === UserType.Piloto ? <DriverActionsPage /> : null}
    </section>
  );
}

function PageHeader() {
  return (
    <div className="border-b border-gray-200 pb-6">
      <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
        Ações
      </p>
      <h2 className="mt-2 text-3xl font-semibold">Cadastros</h2>
    </div>
  );
}

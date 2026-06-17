import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth";
import { UserType } from "../../types";
import { AdminActionsPage } from "./admin";
import { ConstructorActionsPage } from "./constructor";
import { ActionsPageHeader } from "./components/page-header";

export function ActionsPage() {
  const { user } = useAuth();

  if (user?.tipo === UserType.Piloto) return <Navigate to="/dashboard" />;
  return (
    <section className="space-y-8">
      <ActionsPageHeader />
      {user?.tipo === UserType.Admin ? <AdminActionsPage /> : null}
      {user?.tipo === UserType.Escuderia ? <ConstructorActionsPage /> : null}
    </section>
  );
}

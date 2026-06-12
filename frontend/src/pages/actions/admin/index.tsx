import { getApiErrorMessage } from "../../../api";
import { StatusMessage } from "../../../components/status-message";
import { useActionCountries } from "../hooks";
import { ConstructorForm } from "./components/constructor-form";
import { DriverForm } from "./components/driver-form";

export function AdminActionsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ConstructorForm />
      <DriverForm />
    </div>
  );
}

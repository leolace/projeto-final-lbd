import { DriverImportForm } from "./components/driver-import-form";
import { DriverSearchForm } from "./components/driver-search-form";

export function ConstructorActionsPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <DriverSearchForm />
      <DriverImportForm />
    </div>
  );
}

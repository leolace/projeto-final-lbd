import {
  BarChart3,
  ListChecks,
  LogOut,
  PanelLeft,
  UserCircle,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { UserType } from "../types";

export function AppShell() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="flex min-h-screen flex-col bg-white text-black">
      <header className="border-b border-gray-200 bg-gray-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-600">
              Projeto Final
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Formula Data</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <nav className="flex gap-2">
              <NavButton icon={PanelLeft} label="Dashboard" to="/dashboard" />
              <NavButton icon={BarChart3} label="Relatórios" to="/reports" />
              {user?.tipo !== UserType.Piloto && (
                <NavButton icon={ListChecks} label="Ações" to="/actions" />
              )}
            </nav>

            <div className="flex items-center gap-3 border-t border-gray-200 pt-3 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
              <div className="flex min-w-0 items-center gap-2 text-sm">
                <UserCircle className="h-5 w-5 shrink-0 text-gray-600" />
                <span className="truncate text-black">{user?.name}</span>
              </div>
              <button
                className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm font-medium text-black transition hover:border-black hover:bg-gray-100"
                onClick={handleLogout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-5 py-8 flex-1">
        <Outlet />
      </div>
    </main>
  );
}

type NavButtonProps = {
  icon: typeof PanelLeft;
  label: string;
  to: string;
};

function NavButton({ icon: Icon, label, to }: NavButtonProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        `inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-medium transition ${
          isActive
            ? "border border-black bg-gray-100 text-black"
            : "border border-gray-300 bg-white text-black hover:border-black hover:bg-gray-100"
        }`
      }
      to={to}
    >
      <Icon className="h-4 w-4" />
      {label}
    </NavLink>
  );
}

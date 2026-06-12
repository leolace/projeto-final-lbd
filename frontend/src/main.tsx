import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./auth";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ActionsPage } from "./pages/actions";
import { DashboardPage } from "./pages/dashboards";
import { HomeRedirect } from "./pages/HomeRedirect";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AdminAirportsByCityReportPage } from "./pages/reports/admin/airports-by-city";
import { AdminHierarchyReportPage } from "./pages/reports/admin/hierarchy";
import { AdminStatusCountsReportPage } from "./pages/reports/admin/status-counts";
import { ConstructorDriverWinsReportPage } from "./pages/reports/constructor/driver-wins";
import { ConstructorStatusCountsReportPage } from "./pages/reports/constructor/status-counts";
import { ReportAccess } from "./pages/reports/components/ReportAccess";
import { DriverStatusCountsReportPage } from "./pages/reports/driver/status-counts";
import { DriverYearPointsReportPage } from "./pages/reports/driver/year-points";
import "./styles.css";
import { UserType } from "./types";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomeRedirect />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: "dashboard",
                element: <DashboardPage />
              },
              {
                path: "reports",
                element: <ReportsPage />
              },
              {
                path: "actions",
                element: <ActionsPage />
              },
              {
                path: "reports/admin/status-counts",
                element: (
                  <ReportAccess userType={UserType.Admin}>
                    <AdminStatusCountsReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/admin/airports-by-city",
                element: (
                  <ReportAccess userType={UserType.Admin}>
                    <AdminAirportsByCityReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/admin/hierarchy",
                element: (
                  <ReportAccess userType={UserType.Admin}>
                    <AdminHierarchyReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/constructor/driver-wins",
                element: (
                  <ReportAccess userType={UserType.Escuderia}>
                    <ConstructorDriverWinsReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/constructor/status-counts",
                element: (
                  <ReportAccess userType={UserType.Escuderia}>
                    <ConstructorStatusCountsReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/driver/year-points",
                element: (
                  <ReportAccess userType={UserType.Piloto}>
                    <DriverYearPointsReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/driver/status-counts",
                element: (
                  <ReportAccess userType={UserType.Piloto}>
                    <DriverStatusCountsReportPage />
                  </ReportAccess>
                )
              }
            ]
          }
        ]
      }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);

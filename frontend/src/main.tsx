import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./auth";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/dashboards";
import { HomeRedirect } from "./pages/HomeRedirect";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ReportAccess } from "./pages/reports/components/ReportAccess";
import { AdminOverviewReportPage } from "./pages/reports/admin/overview";
import { AdminTopConstructorsReportPage } from "./pages/reports/admin/top-constructors";
import { AdminTopDriversReportPage } from "./pages/reports/admin/top-drivers";
import { ConstructorDriversReportPage } from "./pages/reports/constructor/drivers";
import { ConstructorRaceResultsReportPage } from "./pages/reports/constructor/race-results";
import { DriverPerformanceSummaryReportPage } from "./pages/reports/driver/performance-summary";
import { DriverRaceResultsReportPage } from "./pages/reports/driver/race-results";
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
                path: "reports/admin/overview",
                element: (
                  <ReportAccess userType={UserType.Admin}>
                    <AdminOverviewReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/admin/top-drivers",
                element: (
                  <ReportAccess userType={UserType.Admin}>
                    <AdminTopDriversReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/admin/top-constructors",
                element: (
                  <ReportAccess userType={UserType.Admin}>
                    <AdminTopConstructorsReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/constructor/drivers",
                element: (
                  <ReportAccess userType={UserType.Escuderia}>
                    <ConstructorDriversReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/constructor/race-results",
                element: (
                  <ReportAccess userType={UserType.Escuderia}>
                    <ConstructorRaceResultsReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/driver/race-results",
                element: (
                  <ReportAccess userType={UserType.Piloto}>
                    <DriverRaceResultsReportPage />
                  </ReportAccess>
                )
              },
              {
                path: "reports/driver/performance-summary",
                element: (
                  <ReportAccess userType={UserType.Piloto}>
                    <DriverPerformanceSummaryReportPage />
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

import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ActionsPage } from "./pages/actions";
import { DashboardPage } from "./pages/dashboards";
import { HomeRedirect } from "./pages/HomeRedirect";
import { LoginPage } from "./pages/LoginPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AdminAirportsByCityReportPage } from "./pages/reports/admin/airports-by-city";
import { AdminConstructorsRacesReportPage } from "./pages/reports/admin/constructors-races";
import { AdminStatusCountsReportPage } from "./pages/reports/admin/status-counts";
import { ConstructorDriverWinsReportPage } from "./pages/reports/constructor/driver-wins";
import { ConstructorStatusCountsReportPage } from "./pages/reports/constructor/status-counts";
import { DriverStatusCountsReportPage } from "./pages/reports/driver/status-counts";
import { DriverYearPointsReportPage } from "./pages/reports/driver/year-points";
import { UserType } from "./types";
import { Provider } from "./provider";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Provider />,
    children: [
      {
        index: true,
        element: <HomeRedirect />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: "dashboard",
                element: <DashboardPage />,
              },
              {
                path: "actions",
                element: <ActionsPage />,
              },
              {
                path: "reports",
                children: [
                  {
                    index: true,
                    element: <ReportsPage />,
                  },
                  {
                    path: "admin",
                    children: [
                      {
                        path: "status-counts",
                        element: (
                          <ProtectedRoute userType={[UserType.Admin]}>
                            <AdminStatusCountsReportPage />
                          </ProtectedRoute>
                        ),
                      },
                      {
                        path: "airports-by-city",
                        element: (
                          <ProtectedRoute userType={[UserType.Admin]}>
                            <AdminAirportsByCityReportPage />
                          </ProtectedRoute>
                        ),
                      },
                      {
                        path: "constructors-races",
                        element: (
                          <ProtectedRoute userType={[UserType.Admin]}>
                            <AdminConstructorsRacesReportPage />
                          </ProtectedRoute>
                        ),
                      },
                    ],
                  },
                  {
                    path: "constructor",
                    children: [
                      {
                        path: "driver-wins",
                        element: (
                          <ProtectedRoute userType={[UserType.Escuderia]}>
                            <ConstructorDriverWinsReportPage />
                          </ProtectedRoute>
                        ),
                      },
                      {
                        path: "status-counts",
                        element: (
                          <ProtectedRoute userType={[UserType.Escuderia]}>
                            <ConstructorStatusCountsReportPage />
                          </ProtectedRoute>
                        ),
                      },
                    ],
                  },
                  {
                    path: "driver",
                    children: [
                      {
                        path: "year-points",
                        element: (
                          <ProtectedRoute userType={[UserType.Piloto]}>
                            <DriverYearPointsReportPage />
                          </ProtectedRoute>
                        ),
                      },
                      {
                        path: "status-counts",
                        element: (
                          <ProtectedRoute userType={[UserType.Piloto]}>
                            <DriverStatusCountsReportPage />
                          </ProtectedRoute>
                        ),
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

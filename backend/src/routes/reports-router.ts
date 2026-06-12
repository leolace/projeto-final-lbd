import { Router } from "express";
import { HttpError } from "../errors/http-error.js";
import { getAuthenticatedUser, requireAuth } from "../middleware/require-auth.js";
import {
  getAdminAirportsByCityReport,
  getAdminHierarchyReport,
  getAdminStatusCountsReport,
  getConstructorDriverWinsReport,
  getConstructorStatusCountsReport,
  getDriverStatusCountsReport,
  getDriverYearPointsReport
} from "../services/reports-service.js";
import { UserType, type AuthUser } from "../types/auth.js";
import { getPaginationFromRequest } from "../utils/pagination.js";

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

function requireUserType(user: AuthUser, tipo: UserType) {
  if (user.tipo !== tipo) {
    throw new HttpError(403, "Report not available for this user type");
  }
}

function getRequiredStringQuery(value: unknown, label: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `Missing ${label} query parameter`);
  }

  return value;
}

reportsRouter.get("/admin/status-counts", async (request, response, next) => {
  try {
    const user = getAuthenticatedUser(request);
    requireUserType(user, UserType.Admin);

    response.json(
      await getAdminStatusCountsReport(getPaginationFromRequest(request))
    );
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/admin/airports-by-city", async (request, response, next) => {
  try {
    const user = getAuthenticatedUser(request);
    requireUserType(user, UserType.Admin);

    response.json(
      await getAdminAirportsByCityReport(
        getRequiredStringQuery(request.query.city, "city"),
        getPaginationFromRequest(request)
      )
    );
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/admin/hierarchy", async (request, response, next) => {
  try {
    const user = getAuthenticatedUser(request);
    requireUserType(user, UserType.Admin);

    response.json(await getAdminHierarchyReport(getPaginationFromRequest(request)));
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/constructor/driver-wins", async (request, response, next) => {
  try {
    const user = getAuthenticatedUser(request);
    requireUserType(user, UserType.Escuderia);

    response.json(
      await getConstructorDriverWinsReport(
        user,
        getPaginationFromRequest(request)
      )
    );
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/constructor/status-counts", async (request, response, next) => {
  try {
    const user = getAuthenticatedUser(request);
    requireUserType(user, UserType.Escuderia);

    response.json(
      await getConstructorStatusCountsReport(
        user,
        getPaginationFromRequest(request)
      )
    );
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/driver/year-points", async (request, response, next) => {
  try {
    const user = getAuthenticatedUser(request);
    requireUserType(user, UserType.Piloto);

    response.json(
      await getDriverYearPointsReport(user, getPaginationFromRequest(request))
    );
  } catch (error) {
    next(error);
  }
});

reportsRouter.get("/driver/status-counts", async (request, response, next) => {
  try {
    const user = getAuthenticatedUser(request);
    requireUserType(user, UserType.Piloto);

    response.json(
      await getDriverStatusCountsReport(user, getPaginationFromRequest(request))
    );
  } catch (error) {
    next(error);
  }
});

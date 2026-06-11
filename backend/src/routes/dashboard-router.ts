import { Router } from "express";
import { HttpError } from "../errors/http-error.js";
import { getAuthenticatedUser, requireAuth } from "../middleware/require-auth.js";
import { getDashboard } from "../services/dashboard-service.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", requireAuth, async (request, response, next) => {
  try {
    const dashboard = await getDashboard(getAuthenticatedUser(request), {
      seasonId: getSeasonIdFromRequest(request.query.season)
    });

    response.json(dashboard);
  } catch (error) {
    next(error);
  }
});

function getSeasonIdFromRequest(value: unknown) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new HttpError(400, "Invalid season query parameter");
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, "Invalid season query parameter");
  }

  return parsed;
}

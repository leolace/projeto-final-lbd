import { Router } from "express";
import { requireAuth } from "../middleware/require-auth.js";
import { getSeasons } from "../services/seasons-service.js";

export const seasonsRouter = Router();

seasonsRouter.get("/", requireAuth, async (_request, response, next) => {
  try {
    response.json(await getSeasons());
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { getAuthenticatedUser, requireAuth } from "../middleware/require-auth.js";
import {
  createConstructorAction,
  createDriverAction,
  getCountriesForActions
} from "../services/actions-service.js";

export const actionsRouter = Router();

actionsRouter.use(requireAuth);

actionsRouter.get("/countries", async (_request, response, next) => {
  try {
    response.json(await getCountriesForActions());
  } catch (error) {
    next(error);
  }
});

actionsRouter.post("/admin/constructors", async (request, response, next) => {
  try {
    response
      .status(201)
      .json(
        await createConstructorAction(getAuthenticatedUser(request), request.body)
      );
  } catch (error) {
    next(error);
  }
});

actionsRouter.post("/admin/drivers", async (request, response, next) => {
  try {
    response
      .status(201)
      .json(await createDriverAction(getAuthenticatedUser(request), request.body));
  } catch (error) {
    next(error);
  }
});

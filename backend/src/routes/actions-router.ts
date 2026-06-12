import { Router } from "express";
import { getAuthenticatedUser, requireAuth } from "../middleware/require-auth.js";
import {
  createConstructorDriversBatchAction,
  createConstructorAction,
  createDriverAction,
  getCountriesForActions,
  searchConstructorDriverAction
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

actionsRouter.get("/constructor/drivers/search", async (request, response, next) => {
  try {
    response.json(
      await searchConstructorDriverAction(
        getAuthenticatedUser(request),
        request.query.family_name
      )
    );
  } catch (error) {
    next(error);
  }
});

actionsRouter.post("/constructor/drivers/batch", async (request, response, next) => {
  try {
    response
      .status(201)
      .json(
        await createConstructorDriversBatchAction(
          getAuthenticatedUser(request),
          request.body
        )
      );
  } catch (error) {
    next(error);
  }
});

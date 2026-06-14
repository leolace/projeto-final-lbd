import { Router } from "express";
import { getAuthenticatedUser, requireAuth } from "../middleware/require-auth.js";
import { login } from "../services/auth-service.js";
import {
  createUserLog,
  getRequestIpAddress
} from "../utils/user-log.js";

export const authRouter = Router();

authRouter.post("/login", async (request, response, next) => {
  try {
    const { login: loginValue, password } = request.body as {
      login?: unknown;
      password?: unknown;
    };

    if (typeof loginValue !== "string" || typeof password !== "string") {
      response.status(400).json({
        ok: false,
        error: "login and password are required"
      });
      return;
    }

    const result = await login(loginValue, password);

    await createUserLog({
      userId: result.user.userId,
      action: "LOGIN STATUS 200",
      ipAddress: getRequestIpAddress(request)
    });

    response.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, (request, response) => {
  response.json({
    user: getAuthenticatedUser(request)
  });
});

authRouter.post("/logout", requireAuth, async (request, response, next) => {
  try {
    getAuthenticatedUser(request);

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

import { Router } from "express";
import { getAuthenticatedUser, requireAuth } from "../middleware/require-auth.js";
import { login, logout } from "../services/auth-service.js";

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
    const user = getAuthenticatedUser(request);

    await logout(user.userId);

    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

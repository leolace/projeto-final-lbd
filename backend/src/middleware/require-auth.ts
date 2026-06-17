import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../errors/http-error.js";
import { getUserById, verifyToken } from "../services/auth-service.js";
import type { AuthUser } from "../types/auth.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction
) {
  try {
    const authorization = request.header("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Bearer token não encontrado");
    }

    const token = authorization.slice("Bearer ".length);
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);

    if (!user) {
      throw new HttpError(401, "Usuário não encontrado");
    }

    request.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function getAuthenticatedUser(request: Request) {
  if (!request.user) {
    throw new HttpError(401, "Missing authenticated user");
  }

  return request.user;
}

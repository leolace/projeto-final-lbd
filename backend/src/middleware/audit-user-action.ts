import type { NextFunction, Request, Response } from "express";
import {
  createUserLog,
  getRequestIpAddress
} from "../utils/user-log.js";

export function auditUserAction(
  request: Request,
  response: Response,
  next: NextFunction
) {
  // O log é gravado após a resposta, quando o status HTTP final já é conhecido.
  // Isso evita alterar a resposta principal caso a auditoria falhe.
  response.once("finish", () => {
    const user = request.user;

    if (!user) {
      return;
    }

    void createUserLog({
      userId: user.userId,
      action: createActionDescription(request, response.statusCode),
      ipAddress: getRequestIpAddress(request)
    });
  });

  next();
}

function createActionDescription(request: Request, statusCode: number) {
  // A query string é descartada para não persistir filtros, tokens ou dados
  // sensíveis nos logs de auditoria.
  const path = request.originalUrl.split("?", 1)[0] ?? request.path;

  if (request.method === "POST" && path === "/auth/logout") {
    return `LOGOUT STATUS ${statusCode}`;
  }

  return `${request.method} ${path} STATUS ${statusCode}`;
}

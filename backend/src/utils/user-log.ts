import type { Request } from "express";
import { query } from "../db/service.js";

type CreateUserLogInput = {
  userId: string;
  action: string;
  ipAddress?: string | null;
};

export async function createUserLog({
  userId,
  action,
  ipAddress
}: CreateUserLogInput) {
  try {
    await query(
      `
        insert into users_log (userId, action, ip_address)
        values ($1, $2, $3)
      `,
      [userId, action, normalizeIpAddress(ipAddress)]
    );
  } catch (error) {
    console.error("Failed to create user audit log", error);
  }
}

export function getRequestIpAddress(request: Request) {
  return request.ip || request.socket.remoteAddress || null;
}

function normalizeIpAddress(ipAddress: string | null | undefined) {
  const normalized = ipAddress?.trim();

  return normalized ? normalized : null;
}

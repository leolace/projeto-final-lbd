import jwt from "jsonwebtoken";
import { HttpError } from "../errors/http-error.js";
import { query } from "../db/service.js";
import { UserType, type AuthUser, type TokenPayload } from "../types/auth.js";

const defaultJwtSecret = "development-secret";

function getJwtSecret() {
  return process.env.JWT_SECRET ?? defaultJwtSecret;
}

function mapUser(row: {
  userid: string;
  login: string;
  tipo: AuthUser["tipo"];
  idoriginal: string | null;
  name: string;
}): AuthUser {
  return {
    userId: row.userid,
    login: row.login,
    tipo: row.tipo,
    idOriginal: row.idoriginal,
    name: row.name
  };
}

export async function login(loginValue: string, password: string) {
  const result = await query<{
    userid: string;
    login: string;
    tipo: AuthUser["tipo"];
    idoriginal: string | null;
    name: string;
  }>(
    `
      select
        userid,
        login,
        tipo,
        idoriginal,
        name
      from users
      where login = $1
        and password = crypt($2, password)
      limit 1
    `,
    [loginValue, password]
  );

  const row = result.rows[0];

  if (!row) {
    throw new HttpError(401, "Invalid login or password");
  }

  const user = mapUser(row);
  const token = jwt.sign(
    {
      userId: user.userId,
      tipo: user.tipo
    } satisfies TokenPayload,
    getJwtSecret(),
    { expiresIn: "8h" }
  );

  return { token, user };
}

export async function getUserById(userId: string) {
  const result = await query<{
    userid: string;
    login: string;
    tipo: AuthUser["tipo"];
    idoriginal: string | null;
    name: string;
  }>(
    `
      select
        userid,
        login,
        tipo,
        idoriginal,
        name
      from users
      where userid = $1
      limit 1
    `,
    [userId]
  );

  const row = result.rows[0];

  return row ? mapUser(row) : null;
}

export function verifyToken(token: string): TokenPayload {
  try {
    const payload = jwt.verify(token, getJwtSecret());

    if (
      typeof payload === "object" &&
      typeof payload.userId === "string" &&
      (payload.tipo === UserType.Admin ||
        payload.tipo === UserType.Escuderia ||
        payload.tipo === UserType.Piloto)
    ) {
      return {
        userId: payload.userId,
        tipo: payload.tipo
      };
    }
  } catch {
    throw new HttpError(401, "Invalid or expired token");
  }

  throw new HttpError(401, "Invalid token payload");
}

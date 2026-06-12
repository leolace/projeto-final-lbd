import { pool } from "../db/client.js";
import { query } from "../db/service.js";
import { HttpError } from "../errors/http-error.js";
import { UserType, type AuthUser } from "../types/auth.js";

type CreateConstructorInput = {
  constructor_ref: string;
  name: string;
  country_id: number;
  wikipedia_url: string;
};

type CreateDriverInput = {
  driver_ref: string;
  given_name: string;
  family_name: string;
  date_of_birth: string;
  country_id: number;
};

type CreateDriversBatchInput = {
  drivers: CreateDriverInput[];
};

type InsertedDriver = CreateDriverInput & {
  id: number;
};

type PgError = {
  code?: string;
  constraint?: string;
};

export async function getCountriesForActions() {
  const result = await query<{
    id: number;
    name: string;
    nationality: string | null;
  }>(`
    select
      id,
      name,
      nationality
    from countries
    where nationality is not null
    order by name asc
  `);

  return {
    countries: result.rows
  };
}

export async function createConstructorAction(user: AuthUser, body: unknown) {
  requireAdmin(user);

  const input = parseConstructorInput(body);
  const nationality = await getCountryNationality(input.country_id);

  try {
    const result = await query<{
      id: number;
      constructor_ref: string;
      name: string;
      country_id: number;
      wikipedia_url: string;
    }>(
      `
        insert into constructors (
          constructor_ref,
          name,
          nationality,
          country_id,
          wikipedia_url
        )
        values ($1, $2, $3, $4, $5)
        returning
          id,
          constructor_ref,
          name,
          country_id,
          wikipedia_url
      `,
      [
        input.constructor_ref,
        input.name,
        nationality,
        input.country_id,
        input.wikipedia_url
      ]
    );

    return {
      constructor: result.rows[0]
    };
  } catch (error) {
    throw mapInsertError(error, "escuderia");
  }
}

export async function createDriverAction(user: AuthUser, body: unknown) {
  requireAdmin(user);

  const input = parseDriverInput(body);
  const nationality = await getCountryNationality(input.country_id);

  try {
    const result = await query<{
      id: number;
      driver_ref: string;
      given_name: string;
      family_name: string;
      date_of_birth: string;
      country_id: number;
    }>(
      `
        insert into drivers (
          driver_ref,
          given_name,
          family_name,
          nationality,
          date_of_birth,
          country_id
        )
        values ($1, $2, $3, $4, $5, $6)
        returning
          id,
          driver_ref,
          given_name,
          family_name,
          date_of_birth::text as date_of_birth,
          country_id
      `,
      [
        input.driver_ref,
        input.given_name,
        input.family_name,
        nationality,
        input.date_of_birth,
        input.country_id
      ]
    );

    return {
      driver: result.rows[0]
    };
  } catch (error) {
    throw mapInsertError(error, "piloto");
  }
}

export async function searchConstructorDriverAction(
  user: AuthUser,
  familyName: unknown
) {
  requireConstructor(user);

  if (typeof familyName !== "string" || familyName.trim().length === 0) {
    throw new HttpError(400, "Missing family_name");
  }

  const result = await query<{
    driver_ref: string;
    driver_name: string;
    date_of_birth: string;
    country_name: string | null;
    nationality: string | null;
  }>(
    `
      select distinct
        d.driver_ref,
        d.given_name || ' ' || d.family_name as driver_name,
        d.date_of_birth::text as date_of_birth,
        co.name as country_name,
        co.nationality
      from constructors c
      join results r on r.constructor_id = c.id
      join drivers d on d.id = r.driver_id
      left join countries co on co.id = d.country_id
      where c.constructor_ref = $1
        and lower(d.family_name) = lower($2)
      order by driver_name asc
    `,
    [user.idOriginal, familyName.trim()]
  );

  return {
    drivers: result.rows
  };
}

export async function createConstructorDriversBatchAction(
  user: AuthUser,
  body: unknown
) {
  requireConstructor(user);

  const input = parseDriversBatchInput(body);
  await ensureUniqueDriverNames(input.drivers);

  const client = await pool.connect();

  try {
    await client.query("begin");

    const insertedDrivers: InsertedDriver[] = [];

    for (const driver of input.drivers) {
      const nationality = await getCountryNationality(driver.country_id);
      const result = await client.query<{
        id: number;
        driver_ref: string;
        given_name: string;
        family_name: string;
        date_of_birth: string;
        country_id: number;
      }>(
        `
          insert into drivers (
            driver_ref,
            given_name,
            family_name,
            nationality,
            date_of_birth,
            country_id
          )
          values ($1, $2, $3, $4, $5, $6)
          returning
            id,
            driver_ref,
            given_name,
            family_name,
            date_of_birth::text as date_of_birth,
            country_id
        `,
        [
          driver.driver_ref,
          driver.given_name,
          driver.family_name,
          nationality,
          driver.date_of_birth,
          driver.country_id
        ]
      );

      insertedDrivers.push(result.rows[0]);
    }

    await client.query("commit");

    return {
      drivers: insertedDrivers
    };
  } catch (error) {
    await client.query("rollback");
    throw mapInsertError(error, "piloto");
  } finally {
    client.release();
  }
}

function requireAdmin(user: AuthUser) {
  if (user.tipo !== UserType.Admin) {
    throw new HttpError(403, "Action not available for this user type");
  }
}

function requireConstructor(user: AuthUser) {
  if (user.tipo !== UserType.Escuderia) {
    throw new HttpError(403, "Action not available for this user type");
  }
}

async function getCountryNationality(countryId: number) {
  const result = await query<{
    nationality: string | null;
  }>(
    `
      select nationality
      from countries
      where id = $1
      limit 1
    `,
    [countryId]
  );

  const nationality = result.rows[0]?.nationality;

  if (!nationality) {
    throw new HttpError(400, "Country not found or missing nationality");
  }

  return nationality;
}

function parseConstructorInput(body: unknown): CreateConstructorInput {
  const value = getObjectBody(body);

  return {
    constructor_ref: getRequiredString(value, "constructor_ref", 20),
    name: getRequiredString(value, "name", 25),
    country_id: getRequiredPositiveInteger(value, "country_id"),
    wikipedia_url: getRequiredString(value, "wikipedia_url")
  };
}

function parseDriverInput(body: unknown): CreateDriverInput {
  const value = getObjectBody(body);
  const dateOfBirth = getRequiredString(value, "date_of_birth");

  if (!isIsoDate(dateOfBirth)) {
    throw new HttpError(400, "Invalid date_of_birth");
  }

  return {
    driver_ref: getRequiredString(value, "driver_ref", 18),
    given_name: getRequiredString(value, "given_name", 17),
    family_name: getRequiredString(value, "family_name", 23),
    date_of_birth: dateOfBirth,
    country_id: getRequiredPositiveInteger(value, "country_id")
  };
}

function parseDriversBatchInput(body: unknown): CreateDriversBatchInput {
  const value = getObjectBody(body);
  const drivers = value.drivers;

  if (!Array.isArray(drivers) || drivers.length === 0) {
    throw new HttpError(400, "Missing drivers");
  }

  if (drivers.length > 100) {
    throw new HttpError(400, "O arquivo deve conter no máximo 100 pilotos");
  }

  return {
    drivers: drivers.map((driver) => parseDriverInput(driver))
  };
}

async function ensureUniqueDriverNames(drivers: CreateDriverInput[]) {
  const uniqueNames = new Set<string>();

  for (const driver of drivers) {
    const key = createDriverNameKey(driver.given_name, driver.family_name);

    if (uniqueNames.has(key)) {
      throw new HttpError(
        409,
        `Piloto duplicado no arquivo: ${driver.given_name} ${driver.family_name}`
      );
    }

    uniqueNames.add(key);
  }

  const result = await query<{
    given_name: string;
    family_name: string;
  }>(
    `
      select given_name, family_name
      from drivers
      where lower(given_name || ' ' || family_name) = any($1::text[])
      limit 1
    `,
    [Array.from(uniqueNames)]
  );

  const existingDriver = result.rows[0];

  if (existingDriver) {
    throw new HttpError(
      409,
      `Piloto já cadastrado: ${existingDriver.given_name} ${existingDriver.family_name}`
    );
  }
}

function createDriverNameKey(givenName: string, familyName: string) {
  return `${givenName} ${familyName}`.trim().toLowerCase();
}

function getObjectBody(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new HttpError(400, "Invalid request body");
  }

  return body as Record<string, unknown>;
}

function getRequiredString(
  body: Record<string, unknown>,
  key: string,
  maxLength?: number
) {
  const value = body[key];

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `Missing ${key}`);
  }

  const trimmed = value.trim();

  if (maxLength && trimmed.length > maxLength) {
    throw new HttpError(400, `${key} is too long`);
  }

  return trimmed;
}

function getRequiredPositiveInteger(body: Record<string, unknown>, key: string) {
  const value = body[key];
  const parsed = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new HttpError(400, `Invalid ${key}`);
  }

  return parsed;
}

function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(date.valueOf()) && date.toISOString().startsWith(value);
}

function mapInsertError(error: unknown, entityLabel: string) {
  if (!isPgError(error)) {
    return error;
  }

  if (error.code === "23505") {
    return new HttpError(409, `Já existe um cadastro conflitante para esta ${entityLabel}`);
  }

  if (error.code === "23503") {
    return new HttpError(400, "Invalid related record");
  }

  return error;
}

function isPgError(error: unknown): error is PgError {
  return Boolean(error && typeof error === "object" && "code" in error);
}

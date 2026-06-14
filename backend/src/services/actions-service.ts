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

type ImportDriversInput = {
  content: string;
  fileName: string;
};

type ImportDriverRow = CreateDriverInput & {
  lineNumber: number;
  nationality: string;
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

export async function searchConstructorDriversAction(
  user: AuthUser,
  familyName: unknown
) {
  requireConstructor(user);

  if (typeof familyName !== "string" || familyName.trim().length === 0) {
    throw new HttpError(400, "Missing family_name");
  }

  const result = await query<{
    country_name: string | null;
    date_of_birth: string;
    driver_id: number;
    full_name: string;
    nationality: string;
  }>(
    `
      select distinct
        d.id as driver_id,
        d.given_name || ' ' || d.family_name as full_name,
        d.date_of_birth::text as date_of_birth,
        co.name as country_name,
        d.nationality
      from constructors c
      join results r on r.constructor_id = c.id
      join drivers d on d.id = r.driver_id
      left join countries co on co.id = d.country_id
      where c.constructor_ref = $1
        and lower(d.family_name) = lower($2)
      order by full_name asc
    `,
    [user.idOriginal, familyName.trim()]
  );

  return {
    drivers: result.rows.map((driver) => ({
      driverId: driver.driver_id,
      fullName: driver.full_name,
      dateOfBirth: driver.date_of_birth,
      countryName: driver.country_name,
      nationality: driver.nationality
    }))
  };
}

export async function importConstructorDriversAction(
  user: AuthUser,
  body: unknown
) {
  requireConstructor(user);

  const input = parseImportDriversInput(body);
  const rows = await parseImportDriverRows(input);

  await validateNoExistingDriversByName(rows);
  await validateNoExistingDriverRefs(rows);

  const client = await pool.connect();

  try {
    await client.query("begin");

    const insertedDrivers = [];

    for (const row of rows) {
      const result = await client.query<{
        id: number;
        driver_ref: string;
        family_name: string;
        given_name: string;
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
            family_name
        `,
        [
          row.driver_ref,
          row.given_name,
          row.family_name,
          row.nationality,
          row.date_of_birth,
          row.country_id
        ]
      );

      insertedDrivers.push(result.rows[0]);
    }

    await client.query("commit");

    return {
      insertedCount: insertedDrivers.length,
      drivers: insertedDrivers.map((driver) => ({
        driverId: driver.id,
        driverRef: driver.driver_ref,
        fullName: `${driver.given_name} ${driver.family_name}`
      }))
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

async function getCountriesNationalityMap(countryIds: number[]) {
  const result = await query<{
    id: number;
    nationality: string | null;
  }>(
    `
      select
        id,
        nationality
      from countries
      where id = any($1::int[])
    `,
    [countryIds]
  );

  return new Map(
    result.rows
      .filter((country) => Boolean(country.nationality))
      .map((country) => [country.id, country.nationality as string])
  );
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

function parseImportDriversInput(body: unknown): ImportDriversInput {
  const value = getObjectBody(body);

  return {
    content: getRequiredString(value, "content"),
    fileName: getRequiredString(value, "fileName")
  };
}

async function parseImportDriverRows(input: ImportDriversInput) {
  const parsedRows = input.content
    .split(/\r?\n/)
    .map((line, index) => ({
      line: line.trim(),
      lineNumber: index + 1
    }))
    .filter((row) => row.line.length > 0);

  if (parsedRows.length === 0) {
    throw new HttpError(400, "Arquivo sem pilotos para importar");
  }

  const dataRows = isImportHeader(parsedRows[0]?.line)
    ? parsedRows.slice(1)
    : parsedRows;

  if (dataRows.length === 0) {
    throw new HttpError(400, "Arquivo sem pilotos para importar");
  }

  const rows = dataRows.map((row) => parseImportDriverRow(row.line, row.lineNumber));
  const duplicateName = findDuplicate(rows, (row) =>
    `${row.given_name.trim().toLowerCase()}|${row.family_name.trim().toLowerCase()}`
  );

  if (duplicateName) {
    throw new HttpError(
      400,
      `Piloto duplicado no arquivo: ${duplicateName.given_name} ${duplicateName.family_name}`
    );
  }

  const duplicateRef = findDuplicate(rows, (row) => row.driver_ref.trim().toLowerCase());

  if (duplicateRef) {
    throw new HttpError(400, `driver_ref duplicado no arquivo: ${duplicateRef.driver_ref}`);
  }

  const countryIds = Array.from(new Set(rows.map((row) => row.country_id)));
  const countriesNationality = await getCountriesNationalityMap(countryIds);
  const missingCountryId = countryIds.find((countryId) => !countriesNationality.has(countryId));

  if (missingCountryId) {
    throw new HttpError(400, `Country not found or missing nationality: ${missingCountryId}`);
  }

  return rows.map((row) => ({
    ...row,
    nationality: countriesNationality.get(row.country_id) as string
  }));
}

function parseImportDriverRow(line: string, lineNumber: number): ImportDriverRow {
  const columns = line.split(",").map((column) => column.trim());

  if (columns.length !== 5) {
    throw new HttpError(400, `Linha ${lineNumber} deve conter 5 colunas`);
  }

  const [driverRef, givenName, familyName, dateOfBirth, countryId] = columns;

  if (!isIsoDate(dateOfBirth)) {
    throw new HttpError(400, `Linha ${lineNumber} possui date_of_birth inválido`);
  }

  return {
    driver_ref: validateImportString(driverRef, "driver_ref", lineNumber),
    given_name: validateImportString(givenName, "given_name", lineNumber),
    family_name: validateImportString(familyName, "family_name", lineNumber),
    date_of_birth: dateOfBirth,
    country_id: validateImportCountryId(countryId, lineNumber),
    lineNumber,
    nationality: ""
  };
}

function isImportHeader(line?: string) {
  return (
    line?.toLowerCase() ===
    "driver_ref,given_name,family_name,date_of_birth,country_id"
  );
}

function validateImportString(
  value: string,
  key: string,
  lineNumber: number
) {
  if (value.length === 0) {
    throw new HttpError(400, `Linha ${lineNumber} sem ${key}`);
  }

  return value;
}

function validateImportCountryId(value: string, lineNumber: number) {
  const countryId = Number(value);

  if (!Number.isInteger(countryId) || countryId <= 0) {
    throw new HttpError(400, `Linha ${lineNumber} possui country_id inválido`);
  }

  return countryId;
}

async function validateNoExistingDriversByName(rows: ImportDriverRow[]) {
  const result = await query<{
    family_name: string;
    given_name: string;
  }>(
    `
      select
        d.given_name,
        d.family_name
      from drivers d
      join unnest($1::text[], $2::text[]) as imported(given_name, family_name)
        on lower(d.given_name) = lower(imported.given_name)
       and lower(d.family_name) = lower(imported.family_name)
      limit 1
    `,
    [rows.map((row) => row.given_name), rows.map((row) => row.family_name)]
  );

  const existingDriver = result.rows[0];

  if (existingDriver) {
    throw new HttpError(
      409,
      `Piloto já cadastrado: ${existingDriver.given_name} ${existingDriver.family_name}`
    );
  }
}

async function validateNoExistingDriverRefs(rows: ImportDriverRow[]) {
  const result = await query<{
    driver_ref: string;
  }>(
    `
      select driver_ref
      from drivers
      where lower(driver_ref) = any($1::text[])
      limit 1
    `,
    [rows.map((row) => row.driver_ref.toLowerCase())]
  );

  const existingDriver = result.rows[0];

  if (existingDriver) {
    throw new HttpError(409, `driver_ref já cadastrado: ${existingDriver.driver_ref}`);
  }
}

function findDuplicate<TRow>(
  rows: TRow[],
  getKey: (row: TRow) => string
) {
  const seen = new Set<string>();

  for (const row of rows) {
    const key = getKey(row);

    if (seen.has(key)) {
      return row;
    }

    seen.add(key);
  }

  return null;
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

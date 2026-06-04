import { query } from "../db/service.js";
import type {
  PaginationInput,
  PaginationMeta
} from "../utils/pagination.js";
import {
  createPaginationMeta,
  getLimit,
  getOffset,
  getTotalFromRows,
  stripTotalCount
} from "../utils/pagination.js";
import type { AuthUser } from "../types/auth.js";

type PaginatedReport = {
  rows: Record<string, unknown>[];
  pagination: PaginationMeta;
};

type Counted<T extends Record<string, unknown>> = T & {
  total_count: string | number;
};

function createPaginatedReport(
  rows: Counted<Record<string, unknown>>[],
  pagination: PaginationInput
): PaginatedReport {
  const total = getTotalFromRows(rows);

  return {
    rows: stripTotalCount(rows),
    pagination: createPaginationMeta(pagination, total)
  };
}

function createSingleRowReport(
  rows: Record<string, unknown>[],
  pagination: PaginationInput
): PaginatedReport {
  const offset = getOffset(pagination);
  const visibleRows =
    pagination.pageSize === "all"
      ? rows
      : rows.slice(offset, offset + pagination.pageSize);

  return {
    rows: visibleRows,
    pagination: createPaginationMeta(pagination, rows.length)
  };
}

export async function getAdminOverviewReport(pagination: PaginationInput) {
  const result = await query<Record<string, unknown>>(`
    select
      (select count(*) from users)::int as users_count,
      (select count(*) from drivers)::int as drivers_count,
      (select count(*) from constructors)::int as constructors_count,
      (select count(*) from races)::int as races_count,
      (select count(*) from results)::int as results_count
  `);

  return createSingleRowReport(result.rows, pagination);
}

export async function getAdminTopDriversReport(pagination: PaginationInput) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        *,
        count(*) over() as total_count
      from (
        select
          d.id,
          d.driver_ref,
          d.given_name || ' ' || d.family_name as driver_name,
          sum(r.points) as total_points,
          count(*)::int as races_count
        from results r
        join drivers d on d.id = r.driver_id
        group by d.id, d.driver_ref, d.given_name, d.family_name
      ) report
      order by total_points desc nulls last, driver_name asc
      limit $1 offset $2
    `,
    [getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getAdminTopConstructorsReport(pagination: PaginationInput) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        *,
        count(*) over() as total_count
      from (
        select
          c.id,
          c.constructor_ref,
          c.name as constructor_name,
          sum(r.points) as total_points,
          count(distinct r.driver_id)::int as drivers_count
        from results r
        join constructors c on c.id = r.constructor_id
        group by c.id, c.constructor_ref, c.name
      ) report
      order by total_points desc nulls last, constructor_name asc
      limit $1 offset $2
    `,
    [getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getConstructorDriversReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        *,
        count(*) over() as total_count
      from (
        select
          d.id,
          d.driver_ref,
          d.given_name || ' ' || d.family_name as driver_name,
          count(*)::int as races_count,
          sum(r.points) as total_points
        from users u
        join constructors c on c.constructor_ref = u.idoriginal
        join results r on r.constructor_id = c.id
        join drivers d on d.id = r.driver_id
        where u.userid = $1
        group by d.id, d.driver_ref, d.given_name, d.family_name
      ) report
      order by total_points desc nulls last, driver_name asc
      limit $2 offset $3
    `,
    [user.userId, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getConstructorRaceResultsReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        ra.race_date,
        ra.race_name,
        d.given_name || ' ' || d.family_name as driver_name,
        r.position_order,
        r.points,
        r.laps,
        count(*) over() as total_count
      from users u
      join constructors c on c.constructor_ref = u.idoriginal
      join results r on r.constructor_id = c.id
      join races ra on ra.id = r.race_id
      join drivers d on d.id = r.driver_id
      where u.userid = $1
      order by ra.race_date desc, ra.round desc, r.position_order asc
      limit $2 offset $3
    `,
    [user.userId, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getDriverRaceResultsReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        ra.race_date,
        ra.race_name,
        c.name as constructor_name,
        r.grid,
        r.position,
        r.position_order,
        r.points,
        r.laps,
        count(*) over() as total_count
      from users u
      join drivers d on d.driver_ref = u.idoriginal
      join results r on r.driver_id = d.id
      join races ra on ra.id = r.race_id
      join constructors c on c.id = r.constructor_id
      where u.userid = $1
      order by ra.race_date desc, ra.round desc
      limit $2 offset $3
    `,
    [user.userId, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getDriverPerformanceSummaryReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Record<string, unknown>>(
    `
      select
        d.id,
        d.driver_ref,
        d.given_name || ' ' || d.family_name as driver_name,
        count(r.id)::int as races_count,
        coalesce(sum(r.points), 0) as total_points,
        min(r.position_order) as best_position,
        count(*) filter (where r.position_order = 1)::int as wins
      from users u
      join drivers d on d.driver_ref = u.idoriginal
      left join results r on r.driver_id = d.id
      where u.userid = $1
      group by d.id, d.driver_ref, d.given_name, d.family_name
    `,
    [user.userId]
  );

  return createSingleRowReport(result.rows, pagination);
}

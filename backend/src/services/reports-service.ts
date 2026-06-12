import { HttpError } from "../errors/http-error.js";
import { query } from "../db/service.js";
import type { AuthUser } from "../types/auth.js";
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

export async function getAdminStatusCountsReport(pagination: PaginationInput) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        s.status as status_name,
        count(r.id)::int as results_count,
        count(*) over() as total_count
      from status s
      left join results r on r.status_id = s.id
      group by s.id, s.status
      order by results_count desc, status_name asc
      limit $1 offset $2
    `,
    [getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getAdminAirportsByCityReport(
  cityName: string,
  pagination: PaginationInput
) {
  const trimmedCityName = cityName.trim();

  if (!trimmedCityName) {
    throw new HttpError(400, "Informe o nome da cidade");
  }

  const result = await query<Counted<Record<string, unknown>>>(
    `
      with searched_cities as (
        select
          ci.id,
          ci.name,
          ci.latitude,
          ci.longitude
        from cities ci
        join countries co on co.id = ci.country_id
        where co.name = 'Brazil'
          and lower(ci.name) = lower($1)
      ),
      report as (
        select
          sc.name as searched_city_name,
          coalesce(a.iata_code, '-') as iata_code,
          a.name as airport_name,
          airport_city.name as airport_city_name,
          round(distance.distance_km::numeric, 2)::float as distance_km,
          airport_type.type as airport_type
        from searched_cities sc
        join airports a on a.latitude_deg is not null
          and a.longitude_deg is not null
        join airport_types airport_type on airport_type.id = a.airport_type_id
        join cities airport_city on airport_city.id = a.city_id
        join countries airport_country on airport_country.id = airport_city.country_id
        cross join lateral (
          select
            6371 * 2 * asin(
              sqrt(
                power(sin(radians((a.latitude_deg - sc.latitude) / 2)), 2)
                + cos(radians(sc.latitude))
                * cos(radians(a.latitude_deg))
                * power(sin(radians((a.longitude_deg - sc.longitude) / 2)), 2)
              )
            ) as distance_km
        ) distance
        where airport_country.name = 'Brazil'
          and airport_type.type in ('medium_airport', 'large_airport')
          and distance.distance_km <= 100
      )
      select
        *,
        count(*) over() as total_count
      from report
      order by searched_city_name asc, distance_km asc, airport_name asc
      limit $2 offset $3
    `,
    [trimmedCityName, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getAdminHierarchyReport(pagination: PaginationInput) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      with race_stats as (
        select *
        from race_lap_participation_view
      ),
      report as (
        select
          0 as sort_level,
          c.name as sort_name,
          'Escuderia' as level,
          c.name as constructor_name,
          count(distinct r.driver_id)::int as drivers_count,
          null::int as races_count,
          null::text as circuit_name,
          null::float as min_laps,
          null::float as average_laps,
          null::float as max_laps,
          null::text as race_name,
          null::float as registered_laps,
          null::int as participants_count
        from constructors c
        left join results r on r.constructor_id = c.id
        group by c.id, c.name

        union all

        select
          1 as sort_level,
          'Total' as sort_name,
          'Total de corridas' as level,
          null::text as constructor_name,
          null::int as drivers_count,
          count(*)::int as races_count,
          null::text as circuit_name,
          null::float as min_laps,
          null::float as average_laps,
          null::float as max_laps,
          null::text as race_name,
          null::float as registered_laps,
          null::int as participants_count
        from races

        union all

        select
          2 as sort_level,
          circuit_name as sort_name,
          'Circuito' as level,
          null::text as constructor_name,
          null::int as drivers_count,
          count(*)::int as races_count,
          circuit_name,
          min(registered_laps)::float as min_laps,
          round(avg(registered_laps)::numeric, 2)::float as average_laps,
          max(registered_laps)::float as max_laps,
          null::text as race_name,
          null::float as registered_laps,
          null::int as participants_count
        from race_stats
        group by circuit_name

        union all

        select
          3 as sort_level,
          circuit_name || race_name as sort_name,
          'Corrida por circuito' as level,
          null::text as constructor_name,
          null::int as drivers_count,
          null::int as races_count,
          circuit_name,
          null::float as min_laps,
          null::float as average_laps,
          null::float as max_laps,
          race_name,
          registered_laps,
          participants_count
        from race_stats
      )
      select
        level,
        constructor_name,
        drivers_count,
        races_count,
        circuit_name,
        min_laps,
        average_laps,
        max_laps,
        race_name,
        registered_laps,
        participants_count,
        count(*) over() as total_count
      from report
      order by sort_level asc, sort_name asc
      limit $1 offset $2
    `,
    [getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getConstructorDriverWinsReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        driver_name,
        wins_count,
        count(*) over() as total_count
      from get_constructor_driver_wins($1)
      order by wins_count desc, driver_name asc
      limit $2 offset $3
    `,
    [user.idOriginal, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getConstructorStatusCountsReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        status_name,
        results_count,
        count(*) over() as total_count
      from get_constructor_status_counts($1)
      order by results_count desc, status_name asc
      limit $2 offset $3
    `,
    [user.idOriginal, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getDriverYearPointsReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        season_year,
        total_points_year,
        race_date,
        race_name,
        circuit_name,
        race_points,
        count(*) over() as total_count
      from get_driver_year_points_report($1)
      order by season_year desc, race_date asc, race_name asc
      limit $2 offset $3
    `,
    [user.idOriginal, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

export async function getDriverStatusCountsReport(
  user: AuthUser,
  pagination: PaginationInput
) {
  const result = await query<Counted<Record<string, unknown>>>(
    `
      select
        status_name,
        results_count,
        count(*) over() as total_count
      from get_driver_status_counts($1)
      order by results_count desc, status_name asc
      limit $2 offset $3
    `,
    [user.idOriginal, getLimit(pagination), getOffset(pagination)]
  );

  return createPaginatedReport(result.rows, pagination);
}

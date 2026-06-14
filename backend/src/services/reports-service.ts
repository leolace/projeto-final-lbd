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

type ConstructorRaceReportRow = {
  constructor_id: number;
  constructor_name: string;
  drivers_count: number | string;
};

type CircuitRaceReportRow = {
  total_races: number | string;
  circuit_id: number;
  circuit_name: string;
  races_count: number | string;
  min_laps: number | string;
  avg_laps: number | string;
  max_laps: number | string;
  race_id: number | null;
  race_name: string | null;
  season_year: number | null;
  race_date: string | null;
  round: number | null;
  laps_count: number | string | null;
  drivers_count: number | string | null;
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

export async function getAdminConstructorsRacesReport() {
  // O relatório usa junções, LEFT JOIN, agregações, agrupamentos e contagem
  // distinta para manter escuderias sem resultados e circuitos sem corridas.
  const [constructorsResult, circuitsResult] = await Promise.all([
    query<ConstructorRaceReportRow>(`
      select
        c.id as constructor_id,
        c.name as constructor_name,
        count(distinct r.driver_id)::int as drivers_count
      from constructors c
      left join results r on r.constructor_id = c.id
      group by c.id, c.name
      order by c.name asc
    `),
    query<CircuitRaceReportRow>(`
      with race_stats as (
        select
          ra.id::int as race_id,
          ra.race_name,
          s.year as season_year,
          ra.race_date::text as race_date,
          ra.round,
          ra.circuit_id,
          coalesce(max(r.laps), 0)::float as laps_count,
          count(distinct r.driver_id)::int as drivers_count
        from races ra
        join seasons s on s.id = ra.season_id
        left join results r on r.race_id = ra.id
        group by
          ra.id,
          ra.race_name,
          s.year,
          ra.race_date,
          ra.round,
          ra.circuit_id
      ),
      circuit_stats as (
        select
          ci.id as circuit_id,
          ci.name as circuit_name,
          count(rs.race_id)::int as races_count,
          coalesce(min(rs.laps_count), 0)::float as min_laps,
          coalesce(round(avg(rs.laps_count)::numeric, 2), 0)::float as avg_laps,
          coalesce(max(rs.laps_count), 0)::float as max_laps
        from circuits ci
        left join race_stats rs on rs.circuit_id = ci.id
        group by ci.id, ci.name
      )
      select
        (select count(*)::int from race_stats) as total_races,
        cs.circuit_id,
        cs.circuit_name,
        cs.races_count,
        cs.min_laps,
        cs.avg_laps,
        cs.max_laps,
        rs.race_id,
        rs.race_name,
        rs.season_year,
        rs.race_date,
        rs.round,
        rs.laps_count,
        rs.drivers_count
      from circuit_stats cs
      left join race_stats rs on rs.circuit_id = cs.circuit_id
      order by
        cs.circuit_name asc,
        rs.race_date asc nulls last,
        rs.season_year asc nulls last,
        rs.round asc nulls last
    `)
  ]);

  const circuits = new Map<
    number,
    {
      circuitId: number;
      circuitName: string;
      racesCount: number;
      minLaps: number;
      avgLaps: number;
      maxLaps: number;
      races: Array<{
        raceId: number;
        raceName: string;
        seasonYear: number;
        raceDate: string;
        round: number;
        lapsCount: number;
        driversCount: number;
      }>;
    }
  >();

  // As linhas relacionais são agrupadas em memória para formar os três níveis
  // hierárquicos sem executar uma consulta adicional para cada circuito.
  for (const row of circuitsResult.rows) {
    let circuit = circuits.get(row.circuit_id);

    if (!circuit) {
      circuit = {
        circuitId: row.circuit_id,
        circuitName: row.circuit_name,
        racesCount: Number(row.races_count),
        minLaps: Number(row.min_laps),
        avgLaps: Number(row.avg_laps),
        maxLaps: Number(row.max_laps),
        races: []
      };
      circuits.set(row.circuit_id, circuit);
    }

    if (
      row.race_id !== null &&
      row.race_name !== null &&
      row.season_year !== null &&
      row.race_date !== null &&
      row.round !== null
    ) {
      circuit.races.push({
        raceId: row.race_id,
        raceName: row.race_name,
        seasonYear: row.season_year,
        raceDate: row.race_date,
        round: row.round,
        lapsCount: Number(row.laps_count ?? 0),
        driversCount: Number(row.drivers_count ?? 0)
      });
    }
  }

  return {
    constructors: constructorsResult.rows.map((row) => ({
      constructorId: row.constructor_id,
      constructorName: row.constructor_name,
      driversCount: Number(row.drivers_count)
    })),
    racesHierarchy: {
      totalRaces: Number(circuitsResult.rows[0]?.total_races ?? 0),
      circuits: Array.from(circuits.values())
    }
  };
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

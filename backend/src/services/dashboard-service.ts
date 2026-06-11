import { query } from "../db/service.js";
import { HttpError } from "../errors/http-error.js";
import { UserType, type AuthUser } from "../types/auth.js";

type DashboardOptions = {
  seasonId?: number;
};

export async function getDashboard(user: AuthUser, options: DashboardOptions = {}) {
  if (user.tipo === UserType.Admin) {
    return getAdminDashboard(user, options);
  }

  if (user.tipo === UserType.Escuderia) {
    return getConstructorDashboard(user);
  }

  return getDriverDashboard(user);
}

async function getAdminDashboard(user: AuthUser, options: DashboardOptions) {
  const [countsResult, selectedSeason] = await Promise.all([
    query<{
      drivers_count: number | string;
      constructors_count: number | string;
      seasons_count: number | string;
    }>(`
    select
      (select count(*) from drivers)::int as drivers_count,
      (select count(*) from constructors)::int as constructors_count,
      (select count(*) from seasons)::int as seasons_count
  `),
    getSelectedSeason(options.seasonId)
  ]);

  const counts = countsResult.rows[0];
  const selectedSeasonData = selectedSeason
    ? await getSeasonDashboardData(selectedSeason.id)
    : {
        races: [],
        constructors: [],
        drivers: []
      };

  return {
    user,
    roleLabel: UserType.Admin,
    summary: {
      driversCount: Number(counts?.drivers_count ?? 0),
      constructorsCount: Number(counts?.constructors_count ?? 0),
      seasonsCount: Number(counts?.seasons_count ?? 0),
      selectedSeason,
      latestSeasonRaces: selectedSeasonData.races,
      latestSeasonConstructors: selectedSeasonData.constructors,
      latestSeasonDrivers: selectedSeasonData.drivers
    }
  };
}

async function getSelectedSeason(seasonId?: number) {
  if (seasonId) {
    const result = await query<{
      id: number;
      year: number;
    }>(
      `
        select id, year
        from seasons
        where id = $1
        limit 1
      `,
      [seasonId]
    );

    const selectedSeason = result.rows[0] ?? null;

    if (!selectedSeason) {
      throw new HttpError(404, "Season not found");
    }

    return selectedSeason;
  }

  const result = await query<{
    id: number;
    year: number;
  }>(`
    select id, year
    from seasons
    order by year desc
    limit 1
  `);

  return result.rows[0] ?? null;
}

async function getSeasonDashboardData(seasonId: number) {
  const [racesResult, constructorsResult, driversResult] = await Promise.all([
    query<{
      id: number;
      race_name: string;
      circuit_name: string;
      race_date: string;
      race_time: string | null;
      laps_count: number | string;
    }>(
      `
        select
          ra.id::int as id,
          ra.race_name,
          ci.name as circuit_name,
          ra.race_date::text as race_date,
          ra.race_time::text as race_time,
          coalesce(max(r.laps), 0)::float as laps_count
        from races ra
        join circuits ci on ci.id = ra.circuit_id
        left join results r on r.race_id = ra.id
        where ra.season_id = $1
        group by ra.id, ra.round, ra.race_name, ci.name, ra.race_date, ra.race_time
        order by ra.round asc
      `,
      [seasonId]
    ),
    query<{
      id: number;
      constructor_name: string;
      total_points: number | string;
    }>(
      `
        select
          c.id,
          c.name as constructor_name,
          coalesce(sum(r.points), 0)::float as total_points
        from results r
        join races ra on ra.id = r.race_id
        join constructors c on c.id = r.constructor_id
        where ra.season_id = $1
        group by c.id, c.name
        order by total_points desc, c.name asc
      `,
      [seasonId]
    ),
    query<{
      id: number;
      driver_name: string;
      total_points: number | string;
    }>(
      `
        select
          d.id,
          d.given_name || ' ' || d.family_name as driver_name,
          coalesce(sum(r.points), 0)::float as total_points
        from results r
        join races ra on ra.id = r.race_id
        join drivers d on d.id = r.driver_id
        where ra.season_id = $1
        group by d.id, d.given_name, d.family_name
        order by total_points desc, driver_name asc
      `,
      [seasonId]
    )
  ]);

  return {
    races: racesResult.rows.map((race) => ({
      id: race.id,
      raceName: race.race_name,
      circuitName: race.circuit_name,
      raceDate: race.race_date,
      raceTime: race.race_time,
      lapsCount: Number(race.laps_count)
    })),
    constructors: constructorsResult.rows.map((constructorRow) => ({
      id: constructorRow.id,
      constructorName: constructorRow.constructor_name,
      totalPoints: Number(constructorRow.total_points)
    })),
    drivers: driversResult.rows.map((driver) => ({
      id: driver.id,
      driverName: driver.driver_name,
      totalPoints: Number(driver.total_points)
    }))
  };
}

async function getConstructorDashboard(user: AuthUser) {
  const result = await query<{
    constructor_id: number;
    constructor_name: string;
    associated_drivers_count: string;
  }>(
    `
      select
        c.id as constructor_id,
        c.name as constructor_name,
        count(distinct r.driver_id)::text as associated_drivers_count
      from constructors c
      left join results r on r.constructor_id = c.id
      where c.constructor_ref = $1
      group by c.id, c.name
      limit 1
    `,
    [user.idOriginal]
  );

  const row = result.rows[0];

  return {
    user,
    roleLabel: UserType.Escuderia,
    summary: {
      constructorId: row?.constructor_id ?? null,
      constructorName: row?.constructor_name ?? user.name,
      associatedDriversCount: Number(row?.associated_drivers_count ?? 0)
    }
  };
}

async function getDriverDashboard(user: AuthUser) {
  const result = await query<{
    driver_id: number;
    driver_name: string;
    constructor_name: string | null;
  }>(
    `
      select
        d.id as driver_id,
        d.given_name || ' ' || d.family_name as driver_name,
        latest_constructor.name as constructor_name
      from drivers d
      left join lateral (
        select c.name
        from results r
        join races ra on ra.id = r.race_id
        join constructors c on c.id = r.constructor_id
        where r.driver_id = d.id
        order by ra.race_date desc, ra.round desc
        limit 1
      ) latest_constructor on true
      where d.driver_ref = $1
      limit 1
    `,
    [user.idOriginal]
  );

  const row = result.rows[0];

  return {
    user,
    roleLabel: UserType.Piloto,
    summary: {
      driverId: row?.driver_id ?? null,
      driverName: row?.driver_name ?? user.name,
      constructorName: row?.constructor_name
    }
  };
}

export enum UserType {
  Admin = "Admin",
  Escuderia = "Escuderia",
  Piloto = "Piloto"
}

export type AuthUser = {
  userId: string;
  login: string;
  tipo: UserType;
  idOriginal: string | null;
  name: string;
};

export type Season = {
  id: number;
  year: number;
};

export type SeasonsResponse = {
  seasons: Season[];
};

export type AdminDashboardRace = {
  id: number;
  raceName: string;
  circuitName: string;
  raceDate: string;
  raceTime: string | null;
  lapsCount: number;
};

export type AdminDashboardConstructor = {
  id: number;
  constructorName: string;
  totalPoints: number;
};

export type AdminDashboardDriver = {
  id: number;
  driverName: string;
  totalPoints: number;
};

export type AdminDashboardSummary = {
  driversCount: number;
  constructorsCount: number;
  seasonsCount: number;
  selectedSeason: Season | null;
  latestSeasonRaces: AdminDashboardRace[];
  latestSeasonConstructors: AdminDashboardConstructor[];
  latestSeasonDrivers: AdminDashboardDriver[];
};

export type ConstructorDashboardSummary = {
  constructorId: number | null;
  constructorName: string;
  winsCount: number;
  associatedDriversCount: number;
  firstResultsYear: number | null;
  lastResultsYear: number | null;
};

export type DriverDashboardYearCircuitStat = {
  seasonYear: number;
  circuitId: number;
  circuitName: string;
  totalPoints: number;
  winsCount: number;
  racesCount: number;
};

export type DriverDashboardSummary = {
  driverId: number | null;
  driverName: string;
  constructorName: string | null;
  firstResultsYear: number | null;
  lastResultsYear: number | null;
  yearCircuitStats: DriverDashboardYearCircuitStat[];
};

type DashboardBase<TUserType extends UserType, TSummary> = {
  user: AuthUser & { tipo: TUserType };
  roleLabel: TUserType;
  summary: TSummary;
};

export type DashboardResponse =
  | DashboardBase<UserType.Admin, AdminDashboardSummary>
  | DashboardBase<UserType.Escuderia, ConstructorDashboardSummary>
  | DashboardBase<UserType.Piloto, DriverDashboardSummary>;

export type ReportRowsResponse = {
  rows: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    pageSize: number | "all";
    total: number;
    totalPages: number;
  };
};

export type ActionCountry = {
  id: number;
  name: string;
  nationality: string;
};

export type ActionCountriesResponse = {
  countries: ActionCountry[];
};

export type CreateConstructorActionInput = {
  constructor_ref: string;
  name: string;
  country_id: number;
  wikipedia_url: string;
};

export type CreateDriverActionInput = {
  driver_ref: string;
  given_name: string;
  family_name: string;
  date_of_birth: string;
  country_id: number;
};

export type SearchConstructorDriverInput = {
  family_name: string;
};

export type SearchConstructorDriverResponse = {
  drivers: Array<{
    driver_ref: string;
    driver_name: string;
    date_of_birth: string;
    country_name: string | null;
    nationality: string | null;
  }>;
};

export type CreateDriversBatchActionInput = {
  drivers: CreateDriverActionInput[];
};

export type CreateDriversBatchActionResponse = {
  drivers: Array<{
    id: number;
    driver_ref: string;
    given_name: string;
    family_name: string;
    date_of_birth: string;
    country_id: number;
  }>;
};

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

export type DashboardResponse = {
  user: AuthUser;
  roleLabel: string;
  summary: Record<string, unknown>;
};

export type ReportRowsResponse = {
  rows: Array<Record<string, unknown>>;
  pagination: {
    page: number;
    pageSize: number | "all";
    total: number;
    totalPages: number;
  };
};

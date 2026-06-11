import axios, { AxiosError } from "axios";
import type {
  ActionCountriesResponse,
  AuthUser,
  CreateConstructorActionInput,
  CreateDriverActionInput,
  DashboardResponse,
  ReportRowsResponse,
  SeasonsResponse
} from "./types";

const tokenStorageKey = "projeto-final:token";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(tokenStorageKey);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getStoredToken() {
  return localStorage.getItem(tokenStorageKey);
}

export function setStoredToken(token: string) {
  localStorage.setItem(tokenStorageKey, token);
}

export function clearStoredToken() {
  localStorage.removeItem(tokenStorageKey);
}

export function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.error;

    if (typeof message === "string") {
      return message;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Erro inesperado.";
}

export async function loginRequest(login: string, password: string) {
  const response = await api.post<{ token: string; user: AuthUser }>("/auth/login", {
    login,
    password
  });

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get<{ user: AuthUser }>("/auth/me");

  return response.data.user;
}

export async function getDashboard(params?: { season?: number }) {
  const response = await api.get<DashboardResponse>("/dashboard", {
    params
  });

  return response.data;
}

export async function getSeasons() {
  const response = await api.get<SeasonsResponse>("/seasons");

  return response.data;
}

export async function getActionCountries() {
  const response = await api.get<ActionCountriesResponse>("/actions/countries");

  return response.data;
}

export async function createConstructorAction(
  input: CreateConstructorActionInput
) {
  const response = await api.post("/actions/admin/constructors", input);

  return response.data;
}

export async function createDriverAction(input: CreateDriverActionInput) {
  const response = await api.post("/actions/admin/drivers", input);

  return response.data;
}

export type ReportPaginationParams = {
  page: number;
  pageSize: number | "all";
};

export async function getReportRows(
  path: string,
  pagination: ReportPaginationParams
) {
  const response = await api.get<ReportRowsResponse>(path, {
    params: pagination
  });

  return response.data;
}

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearStoredToken,
  getCurrentUser,
  getStoredToken,
  loginRequest,
  logoutRequest,
  setStoredToken,
} from "./api";
import type { AuthUser } from "./types";
import { LoginLoadingState } from "./components/login-loading-state";

const userStorageKey = "projeto-final:user";

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoadingUser: boolean;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState(() => getStoredToken());
  const userQuery = useQuery({
    enabled: Boolean(token),
    queryKey: ["auth", "me", token],
    queryFn: getCurrentUser,
    retry: false,
  });
  const isAuthenticated = Boolean(token && userQuery.data);
  const isLoadingUser = Boolean(token && userQuery.isLoading);
  const user = isAuthenticated ? (userQuery.data ?? null) : null;

  useEffect(() => {
    if (token && userQuery.isError) {
      clearStoredToken();
      localStorage.removeItem(userStorageKey);
      setToken(null);
      queryClient.removeQueries({ queryKey: ["auth", "me"] });
    }
  }, [queryClient, token, userQuery.isError]);

  const login = useCallback(
    async (loginValue: string, password: string) => {
      const result = await loginRequest(loginValue, password);

      setStoredToken(result.token);
      setToken(result.token);
      queryClient.setQueryData(["auth", "me", result.token], result.user);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    if (getStoredToken()) {
      try {
        await logoutRequest();
      } catch {
        // Mesmo com falha de rede, a sessão local deve ser encerrada.
      }
    }

    clearStoredToken();
    localStorage.removeItem(userStorageKey);
    setToken(null);
    queryClient.clear();
  }, [queryClient]);

  if (isLoadingUser) {
    return <LoginLoadingState />;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isLoadingUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}

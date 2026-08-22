import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAccessToken, type Me, type Tokens } from "../api/client";

/**
 * Auth state in memory only (per spec — no browser storage in dev artifacts).
 * A refresh token is kept in state so the access token can be renewed within
 * the session; a full reload logs the user out, which is acceptable here.
 */
interface AuthContextValue {
  user: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<{ message: string }>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const applyTokens = useCallback((tokens: Tokens) => {
    setAccessToken(tokens.access_token);
    setRefreshToken(tokens.refresh_token);
  }, []);

  const refreshMe = useCallback(async () => {
    const me = await api.me();
    setUser(me);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const tokens = await api.login(email, password);
        applyTokens(tokens);
        await refreshMe();
      } finally {
        setLoading(false);
      }
    },
    [applyTokens, refreshMe],
  );

  const register = useCallback(
    (email: string, password: string) => api.register(email, password),
    [],
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshMe }),
    [user, loading, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

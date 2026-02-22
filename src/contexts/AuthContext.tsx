"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Cookies from "js-cookie";
import { authApi, UserOut } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";

const TOKEN_KEY = "plannr_token";

interface AuthContextValue {
  user: UserOut | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role?: string,
  ) => Promise<void>;
  googleSignIn: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserOut | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /** Persist token and attach it to every axios request */
  const applyToken = useCallback((t: string) => {
    setToken(t);
    Cookies.set(TOKEN_KEY, t, { expires: 7, sameSite: "lax" });
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  }, []);

  /** Remove token from state, cookie, and axios defaults */
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    Cookies.remove(TOKEN_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
  }, []);

  /** On mount: restore existing token and fetch /auth/me */
  useEffect(() => {
    const stored = Cookies.get(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
    setToken(stored);
    authApi
      .me()
      .then((u) => setUser(u))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      applyToken(res.access_token);
      setUser(res.user);
    },
    [applyToken],
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role = "member") => {
      const res = await authApi.register({ name, email, password, role });
      applyToken(res.access_token);
      setUser(res.user);
    },
    [applyToken],
  );

  const googleSignIn = useCallback(
    async (credential: string) => {
      const res = await authApi.googleAuth(credential);
      applyToken(res.access_token);
      setUser(res.user);
    },
    [applyToken],
  );

  const value = useMemo(
    () => ({ user, token, loading, login, register, googleSignIn, logout }),
    [user, token, loading, login, register, googleSignIn, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

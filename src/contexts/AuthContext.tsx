"use client";

/**
 * AuthContext — Redux-backed implementation.
 *
 * State is stored in Redux (store/authSlice).  This file keeps the same
 * public API (AuthProvider + useAuth) so every consumer stays unchanged.
 */
import React, { useCallback, useEffect } from "react";
import Cookies from "js-cookie";
import { authApi, UserOut } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";
import {
  setCredentials,
  setToken,
  setLoading,
  clearCredentials,
} from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const TOKEN_KEY = "plannr_token";

export interface AuthContextValue {
  user: UserOut | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserOut>;
  register: (
    name: string,
    email: string,
    password: string,
    role_id?: string,
  ) => Promise<void>;
  googleSignIn: (credential: string) => Promise<UserOut>;
  logout: () => void;
}

// ─── Bootstrap provider ──────────────────────────────────────────────────────

/**
 * Mount this once near the root (inside <ReduxProvider>).
 * It hydrates the auth state from the stored cookie on first load.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const stored = Cookies.get(TOKEN_KEY);
    if (!stored) {
      dispatch(setLoading(false));
      return;
    }
    // Attach the token to every axios request before fetching /me
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
    dispatch(setToken(stored));

    authApi
      .me()
      .then((u) => dispatch(setCredentials({ user: u, token: stored })))
      .catch(() => {
        Cookies.remove(TOKEN_KEY);
        delete apiClient.defaults.headers.common["Authorization"];
        dispatch(clearCredentials());
      })
      .finally(() => dispatch(setLoading(false)));
  }, [dispatch]);

  return <>{children}</>;
}

// ─── useAuth hook ─────────────────────────────────────────────────────────────

/**
 * Returns the current auth state **and** action helpers backed by Redux.
 * Can be called from any client component inside <ReduxProvider>.
 */
export function useAuth(): AuthContextValue {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const loading = useAppSelector((s) => s.auth.loading);

  /** Persist JWT in cookie + axios header, then store in Redux. */
  const applyToken = useCallback(
    (t: string, u: UserOut) => {
      Cookies.set(TOKEN_KEY, t, { expires: 7, sameSite: "lax" });
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      dispatch(setCredentials({ user: u, token: t }));
    },
    [dispatch],
  );

  const logout = useCallback(() => {
    Cookies.remove(TOKEN_KEY);
    delete apiClient.defaults.headers.common["Authorization"];
    dispatch(clearCredentials());
  }, [dispatch]);

  const login = useCallback(
    async (email: string, password: string): Promise<UserOut> => {
      const res = await authApi.login(email, password);
      applyToken(res.access_token, res.user);
      return res.user;
    },
    [applyToken],
  );

  const register = useCallback(
    async (name: string, email: string, password: string, role_id?: string) => {
      const res = await authApi.register({ name, email, password, role_id });
      applyToken(res.access_token, res.user);
    },
    [applyToken],
  );

  const googleSignIn = useCallback(
    async (credential: string): Promise<UserOut> => {
      const res = await authApi.googleAuth(credential);
      applyToken(res.access_token, res.user);
      return res.user;
    },
    [applyToken],
  );

  return { user, token, loading, login, register, googleSignIn, logout };
}

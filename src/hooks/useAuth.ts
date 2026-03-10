"use client";

import { useCallback } from "react";
import Cookies from "js-cookie";
import { authApi, UserOut } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";
import { setCredentials, clearCredentials } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export const TOKEN_KEY = "plannr_token";

export interface UseAuthReturn {
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

/**
 * Returns the Redux-backed auth state and action helpers.
 * Must be called inside a component mounted within <ReduxProvider>.
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const loading = useAppSelector((s) => s.auth.loading);

  /** Persist JWT in cookie + axios header, then hydrate Redux. */
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

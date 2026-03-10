"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { authApi } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";
import {
  setCredentials,
  setToken,
  setLoading,
  clearCredentials,
} from "@/store/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { TOKEN_KEY } from "@/hooks/useAuth";

/**
 * Hydrates Redux auth state from the persisted cookie on app mount.
 * Reads the stored JWT, attaches it to axios, then calls /auth/me to
 * populate the user in the store.
 *
 * Mount this once inside <ReduxProvider> in the root layout.
 * It renders no UI — just returns its children.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const stored = Cookies.get(TOKEN_KEY);
    if (!stored) {
      dispatch(setLoading(false));
      return;
    }

    // Attach token to every axios request before calling /auth/me
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

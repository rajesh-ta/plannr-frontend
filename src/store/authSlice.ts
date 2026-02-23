import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { UserOut } from "@/services/api/auth";

export interface AuthState {
  user: UserOut | null;
  token: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Set both user + token in one action (after a successful login / me call). */
    setCredentials(
      state,
      action: PayloadAction<{ user: UserOut; token: string }>,
    ) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
    },
    /** Persist only the raw token (before /me resolves). */
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    /** Toggle the global loading flag. */
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    /** Clear everything on logout. */
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.loading = false;
    },
  },
});

export const { setCredentials, setToken, setLoading, clearCredentials } =
  authSlice.actions;
export default authSlice.reducer;

import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import authReducer, { AuthState } from "@/store/authSlice";
import projectReducer from "@/store/projectSlice";
import notificationReducer from "@/store/notificationSlice";
import type { UserOut } from "@/services/api/auth";

interface PreloadedState {
  auth?: Partial<AuthState>;
  notification?: {
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  };
}

export function makeStore(preloadedState: PreloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
      project: projectReducer,
      notification: notificationReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        loading: false,
        ...preloadedState.auth,
      },
      ...(preloadedState.notification
        ? { notification: preloadedState.notification }
        : {}),
    },
  });
}

export function makeUser(overrides: Partial<UserOut> = {}): UserOut {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    status: "ACTIVE",
    role_id: "role-1",
    permissions: {},
    ...overrides,
  };
}

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  preloadedState?: PreloadedState;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, ...renderOptions }: RenderWithProvidersOptions = {},
) {
  const store = makeStore(preloadedState);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { makeStore, makeUser } from "../test-utils";

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("usePermissions", () => {
  it("returns true for an explicitly granted permission", () => {
    const store = makeStore({
      auth: {
        user: makeUser({ permissions: { "task:write": true } }),
        token: "tok",
        loading: false,
      },
    });
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(store),
    });
    expect(result.current.can("task:write")).toBe(true);
  });

  it("returns false for a permission not in the user object", () => {
    const store = makeStore({
      auth: {
        user: makeUser({ permissions: { "task:read": true } }),
        token: "tok",
        loading: false,
      },
    });
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(store),
    });
    expect(result.current.can("task:write")).toBe(false);
  });

  it("returns false for all permissions when user is null", () => {
    const store = makeStore({ auth: { user: null, token: null, loading: false } });
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(store),
    });
    expect(result.current.can("task:write")).toBe(false);
    expect(result.current.can("admin:read")).toBe(false);
  });

  it("returns false when permission is explicitly set to false", () => {
    const store = makeStore({
      auth: {
        user: makeUser({ permissions: { "task:write": false } }),
        token: "tok",
        loading: false,
      },
    });
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(store),
    });
    expect(result.current.can("task:write")).toBe(false);
  });

  it("exposes the full permissions map", () => {
    const perms = { "task:read": true, "sprint:read": true };
    const store = makeStore({
      auth: { user: makeUser({ permissions: perms }), token: "t", loading: false },
    });
    const { result } = renderHook(() => usePermissions(), {
      wrapper: wrapper(store),
    });
    expect(result.current.permissions).toEqual(perms);
  });
});

import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import React from "react";
import Cookies from "js-cookie";
import { useAuth } from "@/hooks/useAuth";
import { authApi } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";
import { makeStore, makeUser } from "../test-utils";

jest.mock("@/services/api/auth");
jest.mock("js-cookie");
jest.mock("@/services/api/client", () => ({
  apiClient: { defaults: { headers: { common: {} } } },
}));

const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;
const mockedCookies = Cookies as jest.Mocked<typeof Cookies>;

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

beforeEach(() => jest.clearAllMocks());

describe("useAuth", () => {
  describe("login", () => {
    it("calls authApi.login, sets the cookie, and dispatches setCredentials", async () => {
      const user = makeUser();
      mockedAuthApi.login.mockResolvedValueOnce({
        access_token: "tok-123",
        user,
      });
      const store = makeStore();
      const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

      let returnedUser: ReturnType<typeof makeUser> | undefined;
      await act(async () => {
        returnedUser = await result.current.login("user@test.com", "pass");
      });

      expect(mockedAuthApi.login).toHaveBeenCalledWith("user@test.com", "pass");
      expect(mockedCookies.set).toHaveBeenCalledWith(
        "plannr_token",
        "tok-123",
        expect.objectContaining({ expires: 7 }),
      );
      expect(store.getState().auth.token).toBe("tok-123");
      expect(store.getState().auth.user).toEqual(user);
      expect(returnedUser).toEqual(user);
    });
  });

  describe("logout", () => {
    it("removes the cookie, clears the auth header, and dispatches clearCredentials", () => {
      const store = makeStore({
        auth: { user: makeUser(), token: "tok-abc", loading: false },
      });
      const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

      act(() => result.current.logout());

      expect(mockedCookies.remove).toHaveBeenCalledWith("plannr_token");
      expect((apiClient.defaults.headers.common as Record<string, unknown>)["Authorization"]).toBeUndefined();
      expect(store.getState().auth.user).toBeNull();
      expect(store.getState().auth.token).toBeNull();
    });
  });

  describe("register", () => {
    it("calls authApi.register and applies the token", async () => {
      const user = makeUser();
      mockedAuthApi.register.mockResolvedValueOnce({
        access_token: "reg-tok",
        user,
      });
      const store = makeStore();
      const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

      await act(async () => {
        await result.current.register("Test User", "test@test.com", "secret");
      });

      expect(mockedAuthApi.register).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@test.com",
        password: "secret",
        role_id: undefined,
      });
      expect(store.getState().auth.token).toBe("reg-tok");
    });
  });
});

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import AuthProvider from "@/components/providers/AuthProvider";
import { renderWithProviders } from "../../test-utils";
import Cookies from "js-cookie";
import { authApi } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";

jest.mock("js-cookie");
jest.mock("@/services/api/auth");
jest.mock("@/services/api/client", () => ({
  apiClient: { defaults: { headers: { common: {} } } },
}));

const mockedCookies = Cookies as jest.Mocked<typeof Cookies>;
const mockedAuthApi = authApi as jest.Mocked<typeof authApi>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthProvider", () => {
  it("renders children", () => {
    mockedCookies.get.mockReturnValue(undefined);
    renderWithProviders(
      <AuthProvider>
        <span>Child Content</span>
      </AuthProvider>,
    );
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("skips /auth/me call when no token cookie", async () => {
    mockedCookies.get.mockReturnValue(undefined);
    renderWithProviders(
      <AuthProvider>
        <span>No Token</span>
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(mockedAuthApi.me).not.toHaveBeenCalled();
    });
  });

  it("calls authApi.me when token exists in cookie", async () => {
    mockedCookies.get.mockReturnValue("test-token");
    mockedAuthApi.me.mockResolvedValue({
      id: "u1",
      name: "Test User",
      email: "test@test.com",
      status: "ACTIVE",
      role_id: null,
      role_name: null,
      avatar_url: null,
      created_at: "",
      modified_at: "",
      modified_by: null,
    });
    renderWithProviders(
      <AuthProvider>
        <span>With Token</span>
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(mockedAuthApi.me).toHaveBeenCalledTimes(1);
    });
  });

  it("clears cookie when authApi.me fails", async () => {
    mockedCookies.get.mockReturnValue("bad-token");
    mockedAuthApi.me.mockRejectedValue(new Error("Unauthorized"));
    renderWithProviders(
      <AuthProvider>
        <span>Error Case</span>
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(mockedCookies.remove).toHaveBeenCalledWith("plannr_token");
    });
  });
});

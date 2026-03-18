import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileMenu from "@/components/layout/ProfileMenu";
import { renderWithProviders, makeUser } from "../../test-utils";

// Mock next/navigation
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => "/overview",
}));

// Mock useAuth
const mockLogout = jest.fn();
jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
  TOKEN_KEY: "auth_token",
}));

import { useAuth } from "@/hooks/useAuth";
const mockedUseAuth = useAuth as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("ProfileMenu", () => {
  it("renders initials from user name", () => {
    mockedUseAuth.mockReturnValue({
      user: makeUser({ name: "Alice Smith" }),
      logout: mockLogout,
    });
    renderWithProviders(<ProfileMenu />);
    expect(screen.getByText("AS")).toBeInTheDocument();
  });

  it("renders '?' when user is null", () => {
    mockedUseAuth.mockReturnValue({ user: null, logout: mockLogout });
    renderWithProviders(<ProfileMenu />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("opens menu on avatar click and shows user email", async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      user: makeUser({ name: "Alice Smith", email: "alice@test.com" }),
      logout: mockLogout,
    });
    renderWithProviders(<ProfileMenu />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
  });

  it("calls logout and redirects on sign-out click", async () => {
    const user = userEvent.setup();
    mockedUseAuth.mockReturnValue({
      user: makeUser({ name: "Alice Smith" }),
      logout: mockLogout,
    });
    renderWithProviders(<ProfileMenu />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText(/sign out/i));
    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});

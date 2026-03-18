import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppHeader from "@/components/layout/AppHeader";
import { renderWithProviders, makeUser } from "../../test-utils";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => "/overview",
}));
jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: makeUser({ name: "Test User" }), logout: jest.fn() }),
  TOKEN_KEY: "auth_token",
}));

describe("AppHeader", () => {
  it("renders the Plannr brand name", () => {
    renderWithProviders(<AppHeader />);
    expect(screen.getByText("Plannr")).toBeInTheDocument();
  });

  it("navigates to /overview when brand is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppHeader />);
    await user.click(screen.getByText("Plannr"));
    expect(mockPush).toHaveBeenCalledWith("/overview");
  });

  it("calls onMenuToggle when hamburger is clicked (mobile)", async () => {
    const user = userEvent.setup();
    const onMenuToggle = jest.fn();
    renderWithProviders(<AppHeader onMenuToggle={onMenuToggle} />);
    const menuBtn = screen.getByLabelText("open navigation");
    await user.click(menuBtn);
    expect(onMenuToggle).toHaveBeenCalledTimes(1);
  });
});

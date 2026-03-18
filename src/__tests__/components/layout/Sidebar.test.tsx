import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Sidebar from "@/components/layout/Sidebar";
import { renderWithProviders, makeUser } from "../../test-utils";

const mockPush = jest.fn();
let mockPathname = "/overview";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => mockPathname,
}));

// Mock permission hook
jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: jest.fn(),
}));
import { usePermissions } from "@/hooks/usePermissions";
const mockedUsePermissions = usePermissions as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockedUsePermissions.mockReturnValue({ can: () => false });
});

describe("Sidebar", () => {
  it("renders Overview nav item", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
  });

  it("renders Boards nav item", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getAllByText("Boards").length).toBeGreaterThan(0);
  });

  it("does not render Admin item when user lacks admin:read permission", () => {
    mockedUsePermissions.mockReturnValue({ can: () => false });
    renderWithProviders(<Sidebar />);
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  it("renders Admin item when user has admin:read permission", () => {
    mockedUsePermissions.mockReturnValue({
      can: (perm: string) => perm === "admin:read",
    });
    renderWithProviders(<Sidebar />);
    expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
  });

  it("navigates to /overview when Overview is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);
    await user.click(screen.getAllByText("Overview")[0]);
    expect(mockPush).toHaveBeenCalledWith("/overview");
  });

  it("toggles boards collapse on Boards click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);
    // Projects is visible by default (boardsOpen=true) — rendered in 2 drawers
    expect(screen.getAllByText("Projects").length).toBeGreaterThan(0);
    await user.click(screen.getAllByText("Boards")[0]);
    // After collapsing, Projects should be removed (unmountOnExit)
    await waitFor(() =>
      expect(screen.queryByText("Projects")).not.toBeInTheDocument(),
    );
  });
});

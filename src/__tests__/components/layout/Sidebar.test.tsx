import React from "react";
import { screen } from "@testing-library/react";
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
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders Boards nav item", () => {
    renderWithProviders(<Sidebar />);
    expect(screen.getByText("Boards")).toBeInTheDocument();
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
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("navigates to /overview when Overview is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);
    await user.click(screen.getByText("Overview"));
    expect(mockPush).toHaveBeenCalledWith("/overview");
  });

  it("toggles boards collapse on Boards click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Sidebar />);
    // Projects is visible by default (boardsOpen=true)
    expect(screen.getByText("Projects")).toBeInTheDocument();
    await user.click(screen.getByText("Boards"));
    // After collapsing, Projects should not be visible
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
  });
});

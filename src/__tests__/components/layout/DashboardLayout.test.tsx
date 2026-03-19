import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { renderWithProviders, makeUser } from "../../test-utils";

// ── Module mocks ──────────────────────────────────────────────────────────────

const mockReplace = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace, push: jest.fn() }),
  usePathname: () => "/overview",
}));

jest.mock("@/hooks/useAuth", () => ({
  useAuth: jest.fn(),
  TOKEN_KEY: "plannr_token",
}));

// Stub heavy children so tests stay focused on layout behaviour
jest.mock("@/components/layout/AppHeader", () => ({
  __esModule: true,
  default: ({ onMenuToggle }: { onMenuToggle?: () => void }) => (
    <header data-testid="app-header">
      <button onClick={onMenuToggle}>Toggle Menu</button>
    </header>
  ),
}));

jest.mock("@/components/layout/Sidebar", () => ({
  __esModule: true,
  default: ({
    mobileOpen,
    onClose,
  }: {
    mobileOpen?: boolean;
    onClose?: () => void;
  }) => (
    <nav data-testid="sidebar" data-mobileopen={String(!!mobileOpen)}>
      <button onClick={onClose}>Close Sidebar</button>
    </nav>
  ),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

import { useAuth } from "@/hooks/useAuth";
const mockedUseAuth = useAuth as jest.Mock;

function setAuth(partial: {
  user?: ReturnType<typeof makeUser> | null;
  loading?: boolean;
}) {
  mockedUseAuth.mockReturnValue({
    user: partial.user ?? null,
    loading: partial.loading ?? false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    googleSignIn: jest.fn(),
    token: null,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  // Default: active user, not loading
  setAuth({ user: makeUser({ status: "ACTIVE" }) });
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe("DashboardLayout — rendering", () => {
  it("renders AppHeader", () => {
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("app-header")).toBeInTheDocument();
  });

  it("renders Sidebar", () => {
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("sidebar")).toBeInTheDocument();
  });

  it("renders the children passed to it", () => {
    renderWithProviders(
      <DashboardLayout>
        <span data-testid="child">Hello World</span>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders with Sidebar initially closed (mobileOpen=false)", () => {
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("sidebar")).toHaveAttribute(
      "data-mobileopen",
      "false",
    );
  });
});

// ── Mobile menu toggle ─────────────────────────────────────────────────────────

describe("DashboardLayout — mobile menu toggle", () => {
  it("opens the Sidebar when AppHeader's onMenuToggle is called", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    await user.click(screen.getByRole("button", { name: "Toggle Menu" }));
    expect(screen.getByTestId("sidebar")).toHaveAttribute(
      "data-mobileopen",
      "true",
    );
  });

  it("closes the Sidebar when Sidebar's onClose is called", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    // Open first
    await user.click(screen.getByRole("button", { name: "Toggle Menu" }));
    expect(screen.getByTestId("sidebar")).toHaveAttribute(
      "data-mobileopen",
      "true",
    );
    // Close via sidebar's own handler
    await user.click(screen.getByRole("button", { name: "Close Sidebar" }));
    expect(screen.getByTestId("sidebar")).toHaveAttribute(
      "data-mobileopen",
      "false",
    );
  });

  it("toggles mobileOpen on successive menu toggle clicks", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    const toggleBtn = screen.getByRole("button", { name: "Toggle Menu" });
    await user.click(toggleBtn);
    expect(screen.getByTestId("sidebar")).toHaveAttribute(
      "data-mobileopen",
      "true",
    );
    await user.click(toggleBtn);
    expect(screen.getByTestId("sidebar")).toHaveAttribute(
      "data-mobileopen",
      "false",
    );
  });
});

// ── Inactive user handling ────────────────────────────────────────────────────

describe("DashboardLayout — inactive user handling", () => {
  it("returns null (renders nothing) when user is INACTIVE and not loading", () => {
    setAuth({ user: makeUser({ status: "INACTIVE" }), loading: false });
    const { container } = renderWithProviders(
      <DashboardLayout>
        <span data-testid="child">content</span>
      </DashboardLayout>,
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId("app-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("child")).not.toBeInTheDocument();
  });

  it("redirects to /inactive when user status is INACTIVE and not loading", () => {
    setAuth({ user: makeUser({ status: "INACTIVE" }), loading: false });
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(mockReplace).toHaveBeenCalledWith("/inactive");
  });

  it("calls router.replace only once for an INACTIVE user", () => {
    setAuth({ user: makeUser({ status: "INACTIVE" }), loading: false });
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it("does NOT redirect when user is ACTIVE", () => {
    setAuth({ user: makeUser({ status: "ACTIVE" }) });
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("does NOT redirect while loading is true, even if user is INACTIVE", () => {
    setAuth({ user: makeUser({ status: "INACTIVE" }), loading: true });
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("renders the layout normally while loading (user not yet resolved)", () => {
    setAuth({ user: null, loading: true });
    renderWithProviders(
      <DashboardLayout>
        <span data-testid="child">content</span>
      </DashboardLayout>,
    );
    expect(screen.getByTestId("app-header")).toBeInTheDocument();
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("does NOT redirect when user is null (unauthenticated, not INACTIVE)", () => {
    setAuth({ user: null, loading: false });
    renderWithProviders(
      <DashboardLayout>
        <span>content</span>
      </DashboardLayout>,
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

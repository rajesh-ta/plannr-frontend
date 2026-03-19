import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMediaQuery } from "@mui/material";
import UsersDataGrid from "@/components/admin/UsersDataGrid";
import { usersApi } from "@/services/api/users";
import { renderWithProviders } from "../../test-utils";
import type { User } from "@/services/api/users";
import type { Role } from "@/services/api/roles";

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock("@mui/material", () => ({
  ...jest.requireActual("@mui/material"),
  useMediaQuery: jest.fn(),
}));

// Lightweight DataGrid stand-in: renders every row/cell so assertions work in JSDOM
jest.mock("@mui/x-data-grid", () => ({
  DataGrid: ({
    rows,
    columns,
  }: {
    rows: Record<string, unknown>[];
    columns: {
      field: string;
      renderCell?: (p: unknown) => React.ReactNode;
      valueGetter?: (v: unknown, row: unknown) => unknown;
    }[];
  }) => (
    <div data-testid="data-grid">
      {rows.map((row) => (
        <div key={String(row.id)} data-testid={`row-${row.id}`}>
          {columns.map((col) => (
            <div key={col.field} data-testid={`cell-${col.field}`}>
              {col.renderCell
                ? col.renderCell({ row, value: row[col.field] })
                : col.valueGetter
                  ? String(col.valueGetter(row[col.field], row) ?? "")
                  : String(row[col.field] ?? "")}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  GridToolbar: () => <div data-testid="grid-toolbar" />,
}));

jest.mock("@/services/api/users", () => ({
  usersApi: { update: jest.fn() },
}));

// Stub sub-cells with minimal interactive HTML so we can test the grid's
// callback wiring and state management in isolation.
jest.mock("@/components/admin/UserRoleCell", () => ({
  __esModule: true,
  default: ({
    userId,
    roleName,
    canEdit,
    onStartEdit,
    onCommit,
    onCancel,
  }: {
    userId: string;
    roleName: string | null;
    canEdit?: boolean;
    onStartEdit: (id: string, field: "role" | "status", value: string) => void;
    onCommit: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid={`role-cell-${userId}`}>
      <span>{roleName ?? "—"}</span>
      {canEdit && (
        <button onClick={() => onStartEdit(userId, "role", roleName ?? "—")}>
          Edit Role
        </button>
      )}
      <button onClick={onCommit}>Save Role</button>
      <button onClick={onCancel}>Cancel Role</button>
    </div>
  ),
}));

jest.mock("@/components/admin/UserStatusCell", () => ({
  __esModule: true,
  default: ({
    userId,
    status,
    canEdit,
    onStartEdit,
    onCommit,
    onCancel,
  }: {
    userId: string;
    status: string;
    canEdit?: boolean;
    onStartEdit: (id: string, field: "role" | "status", value: string) => void;
    onCommit: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid={`status-cell-${userId}`}>
      <span>{status}</span>
      {canEdit && (
        <button onClick={() => onStartEdit(userId, "status", status)}>
          Edit Status
        </button>
      )}
      <button onClick={onCommit}>Save Status</button>
      <button onClick={onCancel}>Cancel Status</button>
    </div>
  ),
}));

// ── Factories & shared helpers ────────────────────────────────────────────────

const mockedUseMediaQuery = useMediaQuery as jest.Mock;
const mockedUsersApi = usersApi as jest.Mocked<typeof usersApi>;

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "Alice Smith",
    email: "alice@example.com",
    role_id: "r1",
    role_name: "PROJECT_DEVELOPER",
    status: "ACTIVE",
    last_modified_on: null,
    last_modified_by: null,
    avatar_url: null,
    auth_provider: "email",
    created_at: "",
    ...overrides,
  };
}

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: "r1",
    role_name: "PROJECT_DEVELOPER",
    description: null,
    is_active: true,
    created_at: "",
    modified_at: "",
    ...overrides,
  };
}

const onRefresh = jest.fn().mockResolvedValue(undefined);
const onError = jest.fn();

interface GridProps {
  users: User[];
  roles: Role[];
  modifierNames: Record<string, string>;
  onRefresh: () => Promise<void>;
  onError: (msg: string) => void;
  canWrite?: boolean;
}

function buildProps(overrides: Partial<GridProps> = {}): GridProps {
  return {
    users: [makeUser()],
    roles: [makeRole()],
    modifierNames: {},
    onRefresh,
    onError,
    canWrite: true,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseMediaQuery.mockReturnValue(false); // desktop by default
  mockedUsersApi.update.mockResolvedValue(undefined as unknown as User);
});

// ── Desktop layout ─────────────────────────────────────────────────────────────

describe("UsersDataGrid — desktop layout", () => {
  it("renders DataGrid (not the mobile card layout)", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.getByTestId("data-grid")).toBeInTheDocument();
  });

  it("renders a row for every user", () => {
    const users = [
      makeUser({ id: "u1" }),
      makeUser({ id: "u2", name: "Bob Jones", email: "bob@example.com" }),
    ];
    renderWithProviders(<UsersDataGrid {...buildProps({ users })} />);
    expect(screen.getByTestId("row-u1")).toBeInTheDocument();
    expect(screen.getByTestId("row-u2")).toBeInTheDocument();
  });

  it("renders user name in the name column", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders user email in the email column", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("renders a role cell and status cell for each user row", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.getByTestId("role-cell-u1")).toBeInTheDocument();
    expect(screen.getByTestId("status-cell-u1")).toBeInTheDocument();
  });

  it("renders modifier name in last-modified-by column", () => {
    renderWithProviders(
      <UsersDataGrid {...buildProps({ modifierNames: { u1: "Bob" } })} />,
    );
    const cell = screen.getByTestId("cell-last_modified_by");
    expect(cell).toHaveTextContent("Bob");
  });

  it("shows '—' in last-modified-by when no modifier exists for the user", () => {
    renderWithProviders(
      <UsersDataGrid {...buildProps({ modifierNames: {} })} />,
    );
    const cell = screen.getByTestId("cell-last_modified_by");
    expect(cell).toHaveTextContent("—");
  });

  it("shows '—' in last-modified-on when date is null", () => {
    renderWithProviders(
      <UsersDataGrid
        {...buildProps({ users: [makeUser({ last_modified_on: null })] })}
      />,
    );
    const cell = screen.getByTestId("cell-last_modified_on");
    expect(cell).toHaveTextContent("—");
  });

  it("formats a non-null last_modified_on date in the column", () => {
    renderWithProviders(
      <UsersDataGrid
        {...buildProps({
          users: [makeUser({ last_modified_on: "2025-12-01T10:00:00Z" })],
        })}
      />,
    );
    const cell = screen.getByTestId("cell-last_modified_on");
    expect(cell).not.toHaveTextContent("—");
    expect(cell.textContent?.length).toBeGreaterThan(1);
  });

  it("hides Edit Role and Edit Status buttons when canWrite=false", () => {
    renderWithProviders(<UsersDataGrid {...buildProps({ canWrite: false })} />);
    expect(
      screen.queryByRole("button", { name: "Edit Role" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit Status" }),
    ).not.toBeInTheDocument();
  });

  it("shows Edit Role and Edit Status buttons when canWrite=true", () => {
    renderWithProviders(<UsersDataGrid {...buildProps({ canWrite: true })} />);
    expect(
      screen.getByRole("button", { name: "Edit Role" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit Status" }),
    ).toBeInTheDocument();
  });
});

// ── Role edit flow ─────────────────────────────────────────────────────────────

describe("UsersDataGrid — role edit flow", () => {
  it("clicking Edit Role passes the current role value into editing state", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.click(screen.getByRole("button", { name: "Edit Role" }));
    expect(
      screen.getByRole("button", { name: "Save Role" }),
    ).toBeInTheDocument();
  });

  it("Save Role calls usersApi.update with the matched role_id then onRefresh", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.click(screen.getByRole("button", { name: "Edit Role" }));
    await user.click(screen.getByRole("button", { name: "Save Role" }));
    await waitFor(() =>
      expect(mockedUsersApi.update).toHaveBeenCalledWith("u1", {
        role_id: "r1",
      }),
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("Save Role with unknown role sends empty payload (no role_id)", async () => {
    const user = userEvent.setup();
    const users = [makeUser({ role_name: "UNKNOWN_ROLE" })];
    renderWithProviders(
      <UsersDataGrid {...buildProps({ users, roles: [] })} />,
    );
    await user.click(screen.getByRole("button", { name: "Edit Role" }));
    await user.click(screen.getByRole("button", { name: "Save Role" }));
    await waitFor(() =>
      expect(mockedUsersApi.update).toHaveBeenCalledWith("u1", {}),
    );
  });

  it("Cancel Role resets editing state without calling usersApi", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.click(screen.getByRole("button", { name: "Edit Role" }));
    await user.click(screen.getByRole("button", { name: "Cancel Role" }));
    expect(mockedUsersApi.update).not.toHaveBeenCalled();
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("calls onError and does not call onRefresh when role update API rejects", async () => {
    mockedUsersApi.update.mockRejectedValueOnce(new Error("Network error"));
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.click(screen.getByRole("button", { name: "Edit Role" }));
    await user.click(screen.getByRole("button", { name: "Save Role" }));
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Failed to save changes."),
    );
    expect(onRefresh).not.toHaveBeenCalled();
  });
});

// ── Status edit flow ───────────────────────────────────────────────────────────

describe("UsersDataGrid — status edit flow", () => {
  it("Save Status calls usersApi.update with the status value then onRefresh", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.click(screen.getByRole("button", { name: "Edit Status" }));
    await user.click(screen.getByRole("button", { name: "Save Status" }));
    await waitFor(() =>
      expect(mockedUsersApi.update).toHaveBeenCalledWith("u1", {
        status: "ACTIVE",
      }),
    );
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("Cancel Status resets editing state without calling usersApi", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.click(screen.getByRole("button", { name: "Edit Status" }));
    await user.click(screen.getByRole("button", { name: "Cancel Status" }));
    expect(mockedUsersApi.update).not.toHaveBeenCalled();
  });

  it("calls onError and does not call onRefresh when status update API rejects", async () => {
    mockedUsersApi.update.mockRejectedValueOnce(new Error("Server error"));
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.click(screen.getByRole("button", { name: "Edit Status" }));
    await user.click(screen.getByRole("button", { name: "Save Status" }));
    await waitFor(() =>
      expect(onError).toHaveBeenCalledWith("Failed to save changes."),
    );
    expect(onRefresh).not.toHaveBeenCalled();
  });
});

// ── Mobile layout ──────────────────────────────────────────────────────────────

describe("UsersDataGrid — mobile layout", () => {
  beforeEach(() => {
    mockedUseMediaQuery.mockReturnValue(true); // isMobile = true
  });

  it("does not render the DataGrid when on mobile", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.queryByTestId("data-grid")).not.toBeInTheDocument();
  });

  it("renders a search input", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders user name and email in the card", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
  });

  it("renders 'Role' and 'Status' section labels", () => {
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();
  });

  it("renders a card for every user", () => {
    const users = [
      makeUser({ id: "u1", name: "Alice Smith" }),
      makeUser({ id: "u2", name: "Bob Jones", email: "bob@example.com" }),
    ];
    renderWithProviders(<UsersDataGrid {...buildProps({ users })} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("filters cards by user name", async () => {
    const user = userEvent.setup();
    const users = [
      makeUser({ id: "u1", name: "Alice Smith", email: "alice@example.com" }),
      makeUser({ id: "u2", name: "Bob Jones", email: "bob@example.com" }),
    ];
    renderWithProviders(<UsersDataGrid {...buildProps({ users })} />);
    await user.type(screen.getByRole("textbox"), "Alice");
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
  });

  it("filters cards by email address", async () => {
    const user = userEvent.setup();
    const users = [
      makeUser({ id: "u1", name: "Alice Smith", email: "alice@example.com" }),
      makeUser({ id: "u2", name: "Bob Jones", email: "bob@example.com" }),
    ];
    renderWithProviders(<UsersDataGrid {...buildProps({ users })} />);
    await user.type(screen.getByRole("textbox"), "bob@");
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("filters cards by role_name", async () => {
    const user = userEvent.setup();
    const users = [
      makeUser({ id: "u1", name: "Alice Smith", role_name: "PROJECT_ADMIN" }),
      makeUser({
        id: "u2",
        name: "Bob Jones",
        email: "bob@example.com",
        role_name: "PROJECT_DEVELOPER",
      }),
    ];
    renderWithProviders(<UsersDataGrid {...buildProps({ users })} />);
    await user.type(screen.getByRole("textbox"), "ADMIN");
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.queryByText("Bob Jones")).not.toBeInTheDocument();
  });

  it("shows empty message when no users match the search", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UsersDataGrid {...buildProps()} />);
    await user.type(screen.getByRole("textbox"), "zzz-no-match");
    expect(screen.getByText("No users match your search.")).toBeInTheDocument();
  });

  it("shows last-modified info when both date and modifier name are present", () => {
    const users = [
      makeUser({ id: "u1", last_modified_on: "2025-12-01T10:00:00Z" }),
    ];
    renderWithProviders(
      <UsersDataGrid
        {...buildProps({ users, modifierNames: { u1: "Bob" } })}
      />,
    );
    expect(screen.getByText(/by Bob/)).toBeInTheDocument();
  });

  it("hides the last-modified row when date and modifier name are both absent", () => {
    const users = [makeUser({ id: "u1", last_modified_on: null })];
    renderWithProviders(
      <UsersDataGrid {...buildProps({ users, modifierNames: {} })} />,
    );
    expect(screen.queryByText(/Modified/)).not.toBeInTheDocument();
  });

  it("renders last-modified row when only modifier name is present (no date)", () => {
    const users = [makeUser({ id: "u1", last_modified_on: null })];
    renderWithProviders(
      <UsersDataGrid
        {...buildProps({ users, modifierNames: { u1: "Bob" } })}
      />,
    );
    expect(screen.getByText(/by Bob/)).toBeInTheDocument();
  });

  it("hides Edit Role and Edit Status buttons when canWrite=false", () => {
    renderWithProviders(<UsersDataGrid {...buildProps({ canWrite: false })} />);
    expect(
      screen.queryByRole("button", { name: "Edit Role" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit Status" }),
    ).not.toBeInTheDocument();
  });
});

import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserRoleCell from "@/components/admin/UserRoleCell";
import UserStatusCell from "@/components/admin/UserStatusCell";
import { renderWithProviders } from "../../test-utils";
import { Role } from "@/services/api/roles";

const roles: Role[] = [
  { id: "r1", role_name: "PROJECT_ADMIN", description: null },
  { id: "r2", role_name: "PROJECT_DEVELOPER", description: null },
];

const baseRoleProps = {
  userId: "u1",
  roleName: "PROJECT_ADMIN",
  roles,
  editing: null,
  saving: false,
  canEdit: true,
  onStartEdit: jest.fn(),
  onChangeEdit: jest.fn(),
  onCommit: jest.fn(),
  onCancel: jest.fn(),
};

const baseStatusProps = {
  userId: "u1",
  status: "ACTIVE",
  editing: null,
  saving: false,
  canEdit: true,
  onStartEdit: jest.fn(),
  onChangeEdit: jest.fn(),
  onCommit: jest.fn(),
  onCancel: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("UserRoleCell", () => {
  it("renders role chip with label", () => {
    renderWithProviders(<UserRoleCell {...baseRoleProps} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders '—' chip when roleName is null", () => {
    renderWithProviders(<UserRoleCell {...baseRoleProps} roleName={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("shows edit pencil when canEdit=true", () => {
    renderWithProviders(<UserRoleCell {...baseRoleProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("hides edit pencil when canEdit=false", () => {
    renderWithProviders(<UserRoleCell {...baseRoleProps} canEdit={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onStartEdit when edit button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserRoleCell {...baseRoleProps} />);
    await user.click(screen.getByRole("button"));
    expect(baseRoleProps.onStartEdit).toHaveBeenCalledWith(
      "u1",
      "role",
      "PROJECT_ADMIN",
    );
  });

  it("renders select dropdown in editing mode", () => {
    renderWithProviders(
      <UserRoleCell
        {...baseRoleProps}
        editing={{ userId: "u1", field: "role", value: "PROJECT_ADMIN" }}
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onCommit when save is clicked in edit mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserRoleCell
        {...baseRoleProps}
        editing={{ userId: "u1", field: "role", value: "PROJECT_ADMIN" }}
      />,
    );
    const saveBtn = screen.getByTitle("Save");
    await user.click(saveBtn);
    expect(baseRoleProps.onCommit).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when cancel is clicked in edit mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserRoleCell
        {...baseRoleProps}
        editing={{ userId: "u1", field: "role", value: "PROJECT_ADMIN" }}
      />,
    );
    const cancelBtn = screen.getByTitle("Cancel");
    await user.click(cancelBtn);
    expect(baseRoleProps.onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("UserStatusCell", () => {
  it("renders status chip", () => {
    renderWithProviders(<UserStatusCell {...baseStatusProps} />);
    expect(screen.getByText("ACTIVE")).toBeInTheDocument();
  });

  it("renders INACTIVE status chip", () => {
    renderWithProviders(
      <UserStatusCell {...baseStatusProps} status="INACTIVE" />,
    );
    expect(screen.getByText("INACTIVE")).toBeInTheDocument();
  });

  it("shows edit pencil when canEdit=true", () => {
    renderWithProviders(<UserStatusCell {...baseStatusProps} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("hides edit pencil when canEdit=false", () => {
    renderWithProviders(
      <UserStatusCell {...baseStatusProps} canEdit={false} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("calls onStartEdit when edit is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserStatusCell {...baseStatusProps} />);
    await user.click(screen.getByRole("button"));
    expect(baseStatusProps.onStartEdit).toHaveBeenCalledWith(
      "u1",
      "status",
      "ACTIVE",
    );
  });

  it("renders select in editing mode", () => {
    renderWithProviders(
      <UserStatusCell
        {...baseStatusProps}
        editing={{ userId: "u1", field: "status", value: "ACTIVE" }}
      />,
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onCommit in edit mode", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserStatusCell
        {...baseStatusProps}
        editing={{ userId: "u1", field: "status", value: "ACTIVE" }}
      />,
    );
    await user.click(screen.getByTitle("Save"));
    expect(baseStatusProps.onCommit).toHaveBeenCalledTimes(1);
  });
});

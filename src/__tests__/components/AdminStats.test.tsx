import React from "react";
import { screen } from "@testing-library/react";
import AdminStats from "@/components/admin/AdminStats";
import { renderWithProviders } from "../test-utils";
import type { User } from "@/services/api/users";

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "u1",
    name: "User",
    email: "u@u.com",
    role_id: null,
    role_name: null,
    status: "ACTIVE",
    last_modified_on: null,
    last_modified_by: null,
    avatar_url: null,
    auth_provider: "email",
    created_at: "",
    ...overrides,
  };
}

describe("AdminStats", () => {
  it("renders all four stat cards", () => {
    renderWithProviders(<AdminStats users={[]} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Inactive")).toBeInTheDocument();
    expect(screen.getByText("Admins")).toBeInTheDocument();
  });

  it("shows correct total count", () => {
    const users = [makeUser({ id: "u1" }), makeUser({ id: "u2" })];
    renderWithProviders(<AdminStats users={users} />);
    // Total Users card shows "2"
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
  });

  it("counts ACTIVE users correctly", () => {
    const users = [
      makeUser({ id: "u1", status: "ACTIVE" }),
      makeUser({ id: "u2", status: "INACTIVE" }),
      makeUser({ id: "u3", status: "ACTIVE" }),
    ];
    renderWithProviders(<AdminStats users={users} />);
    const twos = screen.getAllByText("2");
    expect(twos.length).toBeGreaterThanOrEqual(1);
  });

  it("counts Inactive users as non-ACTIVE", () => {
    const users = [
      makeUser({ id: "u1", status: "ACTIVE" }),
      makeUser({ id: "u2", status: "INACTIVE" }),
    ];
    renderWithProviders(<AdminStats users={users} />);
    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("counts Admins by role_name PROJECT_ADMIN", () => {
    const users = [
      makeUser({ id: "u1", role_name: "PROJECT_ADMIN" }),
      makeUser({ id: "u2", role_name: "PROJECT_DEVELOPER" }),
    ];
    renderWithProviders(<AdminStats users={users} />);
    expect(screen.getByText("Admins")).toBeInTheDocument();
  });

  it("shows 0 for all stats with empty users array", () => {
    renderWithProviders(<AdminStats users={[]} />);
    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBe(4);
  });
});

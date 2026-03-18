import React from "react";
import { screen } from "@testing-library/react";
import AdminHeader from "@/components/admin/AdminHeader";
import { renderWithProviders } from "../../test-utils";

describe("AdminHeader", () => {
  it("renders the Admin Panel title", () => {
    renderWithProviders(<AdminHeader />);
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("renders the descriptive subtitle", () => {
    renderWithProviders(<AdminHeader />);
    expect(
      screen.getByText(/manage users, roles, and access levels/i),
    ).toBeInTheDocument();
  });
});

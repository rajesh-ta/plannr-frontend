import React from "react";
import { screen } from "@testing-library/react";
import WorkItemsGrid from "@/components/board/WorkItemsGrid";
import { renderWithProviders } from "../../test-utils";

describe("WorkItemsGrid", () => {
  it("renders the work items table", () => {
    renderWithProviders(<WorkItemsGrid />);
    // Table headers
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Assigned To")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();
  });

  it("renders mock work item rows", () => {
    renderWithProviders(<WorkItemsGrid />);
    // Check that at least one mock row title appears
    expect(
      screen.getByText(/QA Testing: PI1 Iteration 2/i),
    ).toBeInTheDocument();
  });

  it("renders area path column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("Area Path")).toBeInTheDocument();
  });

  it("renders tags column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });
});

import React from "react";
import { screen } from "@testing-library/react";
import OverviewHeader from "@/components/overview/OverviewHeader";
import { renderWithProviders } from "../../test-utils";

describe("OverviewHeader", () => {
  it("renders the Overview heading", () => {
    renderWithProviders(<OverviewHeader />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
  });

  it("renders the descriptive subtitle", () => {
    renderWithProviders(<OverviewHeader />);
    expect(screen.getByText(/track your team's progress/i)).toBeInTheDocument();
  });

  it("renders today's date", () => {
    renderWithProviders(<OverviewHeader />);
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(screen.getByText(today)).toBeInTheDocument();
  });
});

import React from "react";
import { screen } from "@testing-library/react";
import TaskStatsCards from "@/components/overview/TaskStatsCards";
import { renderWithProviders } from "../../test-utils";
import { TaskStats } from "@/hooks/useOverviewData";

const stats: TaskStats = {
  total: 10,
  new: 3,
  active: 4,
  closed: 2,
  removed: 1,
};

describe("TaskStatsCards", () => {
  it("renders all four stat card titles", () => {
    renderWithProviders(<TaskStatsCards stats={stats} isLoading={false} />);
    expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("renders correct stat values", () => {
    renderWithProviders(<TaskStatsCards stats={stats} isLoading={false} />);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders skeletons when loading", () => {
    renderWithProviders(<TaskStatsCards stats={stats} isLoading={true} />);
    // When loading, the numbers should NOT be rendered
    expect(screen.queryByText("10")).not.toBeInTheDocument();
  });

  it("shows 0% of total when stats are all zeroes", () => {
    const empty: TaskStats = {
      total: 0,
      new: 0,
      active: 0,
      closed: 0,
      removed: 0,
    };
    renderWithProviders(<TaskStatsCards stats={empty} isLoading={false} />);
    // all 5 cards render "0% of total"
    const pctLabels = screen.getAllByText("0% of total");
    expect(pctLabels.length).toBeGreaterThanOrEqual(1);
  });
});

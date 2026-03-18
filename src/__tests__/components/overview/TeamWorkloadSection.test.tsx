import React from "react";
import { screen } from "@testing-library/react";
import TeamWorkloadSection from "@/components/overview/TeamWorkloadSection";
import { renderWithProviders } from "../../test-utils";
import { MemberWorkload } from "@/hooks/useOverviewData";

const workload: MemberWorkload[] = [
  { userId: "1", name: "Alice Smith", total: 5, open: 3 },
  { userId: "2", name: "Bob Jones", total: 2, open: 1 },
];

describe("TeamWorkloadSection", () => {
  it("renders the section title", () => {
    renderWithProviders(
      <TeamWorkloadSection
        workload={workload}
        unassignedOpen={0}
        isLoading={false}
      />,
    );
    expect(screen.getByText(/team workload/i)).toBeInTheDocument();
  });

  it("renders member names", () => {
    renderWithProviders(
      <TeamWorkloadSection
        workload={workload}
        unassignedOpen={0}
        isLoading={false}
      />,
    );
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("renders unassigned count when > 0", () => {
    renderWithProviders(
      <TeamWorkloadSection
        workload={workload}
        unassignedOpen={4}
        isLoading={false}
      />,
    );
    expect(screen.getByText(/unassigned/i)).toBeInTheDocument();
  });

  it("renders skeletons when loading", () => {
    renderWithProviders(
      <TeamWorkloadSection workload={[]} unassignedOpen={0} isLoading={true} />,
    );
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("shows empty state when no workload and no unassigned", () => {
    renderWithProviders(
      <TeamWorkloadSection
        workload={[]}
        unassignedOpen={0}
        isLoading={false}
      />,
    );
    expect(
      screen.getByText(/no tasks have been assigned/i),
    ).toBeInTheDocument();
  });
});

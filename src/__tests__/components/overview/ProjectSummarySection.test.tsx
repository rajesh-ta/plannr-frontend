import React from "react";
import { screen } from "@testing-library/react";
import ProjectSummarySection from "@/components/overview/ProjectSummarySection";
import { renderWithProviders } from "../../test-utils";

const projects = [
  { id: "p1", name: "Project Alpha", description: "desc", created_at: "" },
  { id: "p2", name: "Project Beta", description: "desc2", created_at: "" },
];
const sprints = [
  {
    id: "s1",
    name: "Sprint 1",
    project_id: "p1",
    status: "active",
    start_date: null,
    end_date: null,
    created_at: "",
  },
  {
    id: "s2",
    name: "Sprint 2",
    project_id: "p1",
    status: "active",
    start_date: null,
    end_date: null,
    created_at: "",
  },
];
const allUserStories = [
  {
    id: "us1",
    title: "Story 1",
    sprint_id: "s1",
    status: "open",
    priority: "high",
    created_at: "",
    description: null,
    assigned_to: null,
  },
];

describe("ProjectSummarySection", () => {
  it("renders the section heading", () => {
    renderWithProviders(
      <ProjectSummarySection
        projects={projects}
        sprints={sprints}
        allUserStories={allUserStories}
        isLoading={false}
      />,
    );
    expect(screen.getByText(/project summary/i)).toBeInTheDocument();
  });

  it("renders project count metric", () => {
    renderWithProviders(
      <ProjectSummarySection
        projects={projects}
        sprints={sprints}
        allUserStories={allUserStories}
        isLoading={false}
      />,
    );
    expect(screen.getAllByText("2")[0]).toBeInTheDocument(); // 2 projects
  });

  it("renders sprint count metric", () => {
    renderWithProviders(
      <ProjectSummarySection
        projects={projects}
        sprints={sprints}
        allUserStories={allUserStories}
        isLoading={false}
      />,
    );
    expect(screen.getAllByText("2").length).toBeGreaterThanOrEqual(1);
  });

  it("renders skeleton when loading", () => {
    renderWithProviders(
      <ProjectSummarySection
        projects={[]}
        sprints={[]}
        allUserStories={[]}
        isLoading={true}
      />,
    );
    // Numbers should not be rendered while loading
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });
});

import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectsToolbar from "@/components/projects/ProjectsToolbar";
import { renderWithProviders, makeUser } from "../../test-utils";

jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: jest.fn(),
}));
import { usePermissions } from "@/hooks/usePermissions";
const mockedUsePermissions = usePermissions as jest.Mock;

const projects = [
  { id: "p1", name: "Alpha", description: "", created_at: "" },
  { id: "p2", name: "Beta", description: "", created_at: "" },
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
];

const baseProps = {
  projects,
  loadingProjects: false,
  sprints,
  loadingSprints: false,
  selectedProjectId: "p1",
  selectedSprintId: "s1",
  onProjectChange: jest.fn(),
  onSprintChange: jest.fn(),
  newWorkItemAnchor: null,
  setNewWorkItemAnchor: jest.fn(),
  onAddProject: jest.fn(),
  onAddSprint: jest.fn(),
  onAddUserStory: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  // No write permissions by default
  mockedUsePermissions.mockReturnValue({ can: () => false });
});

describe("ProjectsToolbar", () => {
  it("renders Project and Sprint select labels", () => {
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("Sprint")).toBeInTheDocument();
  });

  it("does not show New Work Item button when user has no write permissions", () => {
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.queryByText(/new work item/i)).not.toBeInTheDocument();
  });

  it("shows New Work Item button when user has project:write", () => {
    mockedUsePermissions.mockReturnValue({
      can: (p: string) => p === "project:write",
    });
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.getByText(/new work item/i)).toBeInTheDocument();
  });

  it("shows loading state in sprint dropdown", () => {
    renderWithProviders(
      <ProjectsToolbar {...baseProps} loadingSprints={true} />,
    );
    // MUI Select renders a combobox div with aria-disabled, not native disabled
    const sprintCombobox = screen.getAllByRole("combobox")[1];
    expect(sprintCombobox).toHaveAttribute("aria-disabled", "true");
  });

  it("shows loading state in project dropdown", () => {
    renderWithProviders(
      <ProjectsToolbar {...baseProps} loadingProjects={true} projects={[]} />,
    );
    const projectCombobox = screen.getAllByRole("combobox")[0];
    expect(projectCombobox).toHaveAttribute("aria-disabled", "true");
  });
});

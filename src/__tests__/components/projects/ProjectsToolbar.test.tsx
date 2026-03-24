import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectsToolbar from "@/components/projects/ProjectsToolbar";
import { renderWithProviders } from "../../test-utils";

// ── Permission mock ────────────────────────────────────────────────────────────

jest.mock("@/hooks/usePermissions", () => ({
  usePermissions: jest.fn(),
}));
import { usePermissions } from "@/hooks/usePermissions";
const mockedUsePermissions = usePermissions as jest.Mock;

// ── Fixtures ───────────────────────────────────────────────────────────────────

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
  onEditProject: jest.fn(),
  onDeleteProject: jest.fn(),
  onEditSprint: jest.fn(),
  onDeleteSprint: jest.fn(),
};

// No permissions by default
beforeEach(() => {
  jest.clearAllMocks();
  mockedUsePermissions.mockReturnValue({ can: () => false });
});

// ── Project dropdown ───────────────────────────────────────────────────────────

describe("ProjectsToolbar — project dropdown", () => {
  it("renders the Project select label", () => {
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(
      screen.getByText("Project", { selector: "label" }),
    ).toBeInTheDocument();
  });

  it("is disabled while projects are loading", () => {
    renderWithProviders(
      <ProjectsToolbar {...baseProps} loadingProjects={true} />,
    );
    const projectCombobox = screen.getAllByRole("combobox")[0];
    expect(projectCombobox).toHaveAttribute("aria-disabled", "true");
  });

  it("is disabled when the projects list is empty", () => {
    renderWithProviders(
      <ProjectsToolbar {...baseProps} projects={[]} selectedProjectId="" />,
    );
    const projectCombobox = screen.getAllByRole("combobox")[0];
    expect(projectCombobox).toHaveAttribute("aria-disabled", "true");
  });

  it("is enabled when projects are loaded and available", () => {
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    const projectCombobox = screen.getAllByRole("combobox")[0];
    expect(projectCombobox).not.toHaveAttribute("aria-disabled", "true");
  });

  it("calls onProjectChange with the selected project id when a project is chosen", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    await user.click(screen.getAllByRole("combobox")[0]);
    await user.click(screen.getByRole("option", { name: "Beta" }));
    expect(baseProps.onProjectChange).toHaveBeenCalledWith("p2");
  });
});

// ── Sprint dropdown ────────────────────────────────────────────────────────────

describe("ProjectsToolbar — sprint dropdown", () => {
  it("renders the Sprint select label", () => {
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(
      screen.getByText("Sprint", { selector: "label" }),
    ).toBeInTheDocument();
  });

  it("is disabled while sprints are loading", () => {
    renderWithProviders(
      <ProjectsToolbar {...baseProps} loadingSprints={true} />,
    );
    const sprintCombobox = screen.getAllByRole("combobox")[1];
    expect(sprintCombobox).toHaveAttribute("aria-disabled", "true");
  });

  it("is disabled when no project is selected", () => {
    renderWithProviders(
      <ProjectsToolbar {...baseProps} selectedProjectId="" />,
    );
    const sprintCombobox = screen.getAllByRole("combobox")[1];
    expect(sprintCombobox).toHaveAttribute("aria-disabled", "true");
  });

  it("is disabled when the sprints list is empty", () => {
    renderWithProviders(
      <ProjectsToolbar {...baseProps} sprints={[]} selectedSprintId="" />,
    );
    const sprintCombobox = screen.getAllByRole("combobox")[1];
    expect(sprintCombobox).toHaveAttribute("aria-disabled", "true");
  });

  it("is enabled when a project is selected and sprints are available", () => {
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    const sprintCombobox = screen.getAllByRole("combobox")[1];
    expect(sprintCombobox).not.toHaveAttribute("aria-disabled", "true");
  });

  it("calls onSprintChange with the selected sprint id when a sprint is chosen", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    await user.click(screen.getAllByRole("combobox")[1]);
    await user.click(screen.getByRole("option", { name: "Sprint 2" }));
    expect(baseProps.onSprintChange).toHaveBeenCalledWith("s2");
  });
});

// ── New Work Item button visibility ───────────────────────────────────────────

describe("ProjectsToolbar — New Work Item button visibility", () => {
  it("hides the button when the user has no write permissions at all", () => {
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.queryByText(/new work item/i)).not.toBeInTheDocument();
  });

  it("shows the button when the user has project:write", () => {
    mockedUsePermissions.mockReturnValue({
      can: (p: string) => p === "project:write",
    });
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.getByText(/new work item/i)).toBeInTheDocument();
  });

  it("shows the button when the user has sprint:write", () => {
    mockedUsePermissions.mockReturnValue({
      can: (p: string) => p === "sprint:write",
    });
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.getByText(/new work item/i)).toBeInTheDocument();
  });

  it("shows the button when the user has story:write", () => {
    mockedUsePermissions.mockReturnValue({
      can: (p: string) => p === "story:write",
    });
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.getByText(/new work item/i)).toBeInTheDocument();
  });
});

// ── New Work Item menu ─────────────────────────────────────────────────────────

describe("ProjectsToolbar — New Work Item menu", () => {
  // Simulate the anchor being set (menu open) by passing a real DOM element
  function renderWithMenuOpen(permissions: (p: string) => boolean) {
    mockedUsePermissions.mockReturnValue({ can: permissions });
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    renderWithProviders(
      <ProjectsToolbar {...baseProps} newWorkItemAnchor={anchor} />,
    );
  }

  it("renders Add Project menu item when user has project:write", () => {
    renderWithMenuOpen((p) => p === "project:write");
    expect(
      screen.getByRole("menuitem", { name: /add project/i }),
    ).toBeInTheDocument();
  });

  it("renders Add Sprint menu item when user has sprint:write", () => {
    renderWithMenuOpen((p) => p === "sprint:write");
    expect(
      screen.getByRole("menuitem", { name: /add sprint/i }),
    ).toBeInTheDocument();
  });

  it("renders Add User Story menu item when user has story:write", () => {
    renderWithMenuOpen((p) => p === "story:write");
    expect(
      screen.getByRole("menuitem", { name: /add user story/i }),
    ).toBeInTheDocument();
  });

  it("renders all three menu items when user has all write permissions", () => {
    renderWithMenuOpen(() => true);
    expect(
      screen.getByRole("menuitem", { name: /add project/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /add sprint/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /add user story/i }),
    ).toBeInTheDocument();
  });

  it("does not render Add Project when user lacks project:write", () => {
    renderWithMenuOpen((p) => p === "story:write");
    expect(
      screen.queryByRole("menuitem", { name: /add project/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render Add Sprint when user lacks sprint:write", () => {
    renderWithMenuOpen((p) => p === "project:write");
    expect(
      screen.queryByRole("menuitem", { name: /add sprint/i }),
    ).not.toBeInTheDocument();
  });

  it("does not render Add User Story when user lacks story:write", () => {
    renderWithMenuOpen((p) => p === "project:write");
    expect(
      screen.queryByRole("menuitem", { name: /add user story/i }),
    ).not.toBeInTheDocument();
  });
});

// ── New Work Item menu callbacks ───────────────────────────────────────────────

describe("ProjectsToolbar — New Work Item menu callbacks", () => {
  async function openMenuAndClick(itemName: RegExp) {
    const user = userEvent.setup();
    mockedUsePermissions.mockReturnValue({ can: () => true });
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    await user.click(screen.getByRole("button", { name: /new work item/i }));
    // setNewWorkItemAnchor is called — simulate menu open by re-rendering with anchor
    expect(baseProps.setNewWorkItemAnchor).toHaveBeenCalled();
  }

  it("calls setNewWorkItemAnchor when New Work Item is clicked", async () => {
    const user = userEvent.setup();
    mockedUsePermissions.mockReturnValue({ can: () => true });
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    await user.click(screen.getByRole("button", { name: /new work item/i }));
    expect(baseProps.setNewWorkItemAnchor).toHaveBeenCalledTimes(1);
  });

  it("calls onAddProject when Add Project menu item is clicked", async () => {
    const user = userEvent.setup();
    mockedUsePermissions.mockReturnValue({ can: () => true });
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    renderWithProviders(
      <ProjectsToolbar {...baseProps} newWorkItemAnchor={anchor} />,
    );
    await user.click(screen.getByRole("menuitem", { name: /add project/i }));
    expect(baseProps.onAddProject).toHaveBeenCalledTimes(1);
  });

  it("calls onAddSprint when Add Sprint menu item is clicked", async () => {
    const user = userEvent.setup();
    mockedUsePermissions.mockReturnValue({ can: () => true });
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    renderWithProviders(
      <ProjectsToolbar {...baseProps} newWorkItemAnchor={anchor} />,
    );
    await user.click(screen.getByRole("menuitem", { name: /add sprint/i }));
    expect(baseProps.onAddSprint).toHaveBeenCalledTimes(1);
  });

  it("calls onAddUserStory when Add User Story menu item is clicked", async () => {
    const user = userEvent.setup();
    mockedUsePermissions.mockReturnValue({ can: () => true });
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    renderWithProviders(
      <ProjectsToolbar {...baseProps} newWorkItemAnchor={anchor} />,
    );
    await user.click(screen.getByRole("menuitem", { name: /add user story/i }));
    expect(baseProps.onAddUserStory).toHaveBeenCalledTimes(1);
  });

  it("calls setNewWorkItemAnchor(null) when the menu is closed", async () => {
    const user = userEvent.setup();
    mockedUsePermissions.mockReturnValue({ can: () => true });
    const anchor = document.createElement("button");
    document.body.appendChild(anchor);
    renderWithProviders(
      <ProjectsToolbar {...baseProps} newWorkItemAnchor={anchor} />,
    );
    // Press Escape to close the MUI Menu
    await user.keyboard("{Escape}");
    expect(baseProps.setNewWorkItemAnchor).toHaveBeenCalledWith(null);
  });
});

// ── Project actions menu ───────────────────────────────────────────────────────
//
// The MoreVert icon button next to the Project selector is shown only when
// canWriteProject (project:write) AND a project is selected.
//
// Finding the button: MUI SvgIcon exposes data-testid="<Name>Icon" in
// non-production environments.  "<MoreVert />" → data-testid="MoreVertIcon".
// Using that testId is immune to orphaned <button> elements that earlier tests
// leave in document.body via document.body.appendChild(anchor).
//
describe("ProjectsToolbar — project actions menu", () => {
  function renderWithProjectWrite(
    overrides: Partial<React.ComponentProps<typeof ProjectsToolbar>> = {},
  ) {
    mockedUsePermissions.mockReturnValue({
      can: (p: string) => p === "project:write",
    });
    return renderWithProviders(
      <ProjectsToolbar {...baseProps} {...overrides} />,
    );
  }

  // Returns the IconButton that wraps the first MoreVertIcon in the render.
  // When only project:write is granted (no sprint:write), this is always the
  // project-actions button.
  function getProjectActionsBtn(): HTMLElement {
    return screen
      .getAllByTestId("MoreVertIcon")[0]
      .closest("button") as HTMLElement;
  }

  // ── Visibility ──────────────────────────────────────────────────────────────

  it("does not render the project actions button when user lacks project:write", () => {
    mockedUsePermissions.mockReturnValue({ can: () => false });
    renderWithProviders(<ProjectsToolbar {...baseProps} />);
    expect(screen.queryByTestId("MoreVertIcon")).not.toBeInTheDocument();
  });

  it("does not render the project actions button when no project is selected", () => {
    renderWithProjectWrite({ selectedProjectId: "" });
    expect(screen.queryByTestId("MoreVertIcon")).not.toBeInTheDocument();
  });

  it("renders the project actions icon button when user has project:write and a project is selected", () => {
    renderWithProjectWrite();
    expect(screen.getByTestId("MoreVertIcon")).toBeInTheDocument();
  });

  // ── Menu closed state ────────────────────────────────────────────────────────

  it("does not show Edit Project or Delete Project before the button is clicked", () => {
    renderWithProjectWrite();
    expect(
      screen.queryByRole("menuitem", { name: /edit project/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /delete project/i }),
    ).not.toBeInTheDocument();
  });

  // ── Menu open state ──────────────────────────────────────────────────────────

  it("opens the project actions menu showing Edit Project and Delete Project items", async () => {
    const user = userEvent.setup();
    renderWithProjectWrite();
    await user.click(getProjectActionsBtn());
    expect(
      screen.getByRole("menuitem", { name: /edit project/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /delete project/i }),
    ).toBeInTheDocument();
  });

  // ── Edit Project ─────────────────────────────────────────────────────────────

  it("calls onEditProject when Edit Project is clicked", async () => {
    const user = userEvent.setup();
    const onEditProject = jest.fn();
    renderWithProjectWrite({ onEditProject });
    await user.click(getProjectActionsBtn());
    await user.click(screen.getByRole("menuitem", { name: /edit project/i }));
    expect(onEditProject).toHaveBeenCalledTimes(1);
  });

  it("closes the menu after Edit Project is clicked", async () => {
    const user = userEvent.setup();
    renderWithProjectWrite();
    await user.click(getProjectActionsBtn());
    await user.click(screen.getByRole("menuitem", { name: /edit project/i }));
    expect(
      screen.queryByRole("menuitem", { name: /edit project/i }),
    ).not.toBeInTheDocument();
  });

  // ── Delete Project ───────────────────────────────────────────────────────────

  it("calls onDeleteProject when Delete Project is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteProject = jest.fn();
    renderWithProjectWrite({ onDeleteProject });
    await user.click(getProjectActionsBtn());
    await user.click(screen.getByRole("menuitem", { name: /delete project/i }));
    expect(onDeleteProject).toHaveBeenCalledTimes(1);
  });

  it("closes the menu after Delete Project is clicked", async () => {
    const user = userEvent.setup();
    renderWithProjectWrite();
    await user.click(getProjectActionsBtn());
    await user.click(screen.getByRole("menuitem", { name: /delete project/i }));
    expect(
      screen.queryByRole("menuitem", { name: /delete project/i }),
    ).not.toBeInTheDocument();
  });

  // ── Keyboard close ───────────────────────────────────────────────────────────

  it("closes the menu when Escape is pressed", async () => {
    const user = userEvent.setup();
    renderWithProjectWrite();
    await user.click(getProjectActionsBtn());
    expect(
      screen.getByRole("menuitem", { name: /edit project/i }),
    ).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(
      screen.queryByRole("menuitem", { name: /edit project/i }),
    ).not.toBeInTheDocument();
  });
});

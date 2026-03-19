import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectsDialogs from "@/components/projects/ProjectsDialogs";
import { renderWithProviders, makeUser } from "../../test-utils";
import type { Task } from "@/services/api/tasks";
import type { UserStory } from "@/services/api/userStories";
import type { Sprint } from "@/services/api/sprints";
import type { Project } from "@/services/api/projects";

// ── Child dialog stubs ────────────────────────────────────────────────────────

jest.mock("@/components/sprint/TaskDetailsDialog", () => ({
  __esModule: true,
  default: ({
    open,
    readOnly,
    onClose,
  }: {
    open: boolean;
    readOnly: boolean;
    onClose: () => void;
  }) =>
    open ? (
      <div data-testid="task-details-dialog" data-readonly={String(readOnly)}>
        <button onClick={onClose}>Close Task Dialog</button>
      </div>
    ) : null,
}));

jest.mock("@/components/sprint/UserStoryDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="user-story-dialog">
        <button onClick={onClose}>Close Story Dialog</button>
      </div>
    ) : null,
}));

jest.mock("@/components/sprint/SprintDialog", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="sprint-dialog">
        <button onClick={onClose}>Close Sprint Dialog</button>
      </div>
    ) : null,
}));

jest.mock("@/components/common/DeleteConfirmDialog", () => ({
  __esModule: true,
  default: ({
    open,
    itemName,
    onClose,
    onConfirm,
  }: {
    open: boolean;
    itemName?: string;
    onClose: () => void;
    onConfirm: () => void;
  }) =>
    open ? (
      <div data-testid="delete-story-dialog" data-itemname={itemName ?? ""}>
        <button onClick={onClose}>Cancel Delete</button>
        <button onClick={onConfirm}>Confirm Delete</button>
      </div>
    ) : null,
}));

jest.mock("@/components/sprint/AddProjectDialog", () => ({
  __esModule: true,
  default: ({
    open,
    onClose,
    onCreated,
  }: {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
  }) =>
    open ? (
      <div data-testid="add-project-dialog">
        <button onClick={onClose}>Close Add Project</button>
        <button onClick={onCreated}>Project Created</button>
      </div>
    ) : null,
}));

// ── Factories ─────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    task_no: "T-001",
    title: "My Task",
    user_story_id: "us-1",
    status: "new",
    created_at: "",
    ...overrides,
  };
}

function makeUserStory(overrides: Partial<UserStory> = {}): UserStory {
  return {
    id: "us-1",
    title: "My Story",
    sprint_id: "sp-1",
    status: "new",
    created_at: "",
    ...overrides,
  };
}

function makeSprint(overrides: Partial<Sprint> = {}): Sprint {
  return {
    id: "sp-1",
    name: "Sprint 1",
    project_id: "p-1",
    status: "active",
    created_at: "",
    ...overrides,
  };
}

function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: "p-1",
    name: "Project Alpha",
    created_at: "",
    ...overrides,
  };
}

// ── Shared props (all dialogs closed) ─────────────────────────────────────────

const closedProps = {
  dialogOpen: false,
  selectedTask: null,
  selectedUserStory: undefined,
  onCloseDialog: jest.fn(),
  onSaveTask: jest.fn(),
  userStoryDialogOpen: false,
  editingUserStory: null,
  sprints: [],
  selectedSprintId: "",
  onCloseUserStoryDialog: jest.fn(),
  onSaveUserStory: jest.fn().mockResolvedValue(undefined),
  sprintDialogOpen: false,
  editingSprint: null,
  selectedProjectId: "",
  projects: [],
  onCloseSprintDialog: jest.fn(),
  onSaveSprint: jest.fn().mockResolvedValue(undefined),
  deleteStoryConfirmOpen: false,
  pendingDeleteStoryId: null,
  userStories: [],
  onCloseDeleteStory: jest.fn(),
  onConfirmDeleteStory: jest.fn(),
  addProjectDialogOpen: false,
  onCloseAddProject: jest.fn(),
  onProjectCreated: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

// ── All closed ─────────────────────────────────────────────────────────────────

describe("ProjectsDialogs — all closed", () => {
  it("renders nothing when all dialog flags are false", () => {
    renderWithProviders(<ProjectsDialogs {...closedProps} />);
    expect(screen.queryByTestId("task-details-dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("user-story-dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("sprint-dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("delete-story-dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("add-project-dialog")).not.toBeInTheDocument();
  });
});

// ── TaskDetailsDialog ──────────────────────────────────────────────────────────

describe("ProjectsDialogs — TaskDetailsDialog", () => {
  it("renders when dialogOpen=true", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        dialogOpen={true}
        selectedTask={makeTask()}
      />,
    );
    expect(screen.getByTestId("task-details-dialog")).toBeInTheDocument();
  });

  it("does not render when dialogOpen=false", () => {
    renderWithProviders(<ProjectsDialogs {...closedProps} />);
    expect(screen.queryByTestId("task-details-dialog")).not.toBeInTheDocument();
  });

  it("passes readOnly=true when the user lacks task:write permission", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        dialogOpen={true}
        selectedTask={makeTask()}
      />,
      {
        preloadedState: {
          auth: {
            user: makeUser({ permissions: {} }),
            token: "tok",
            loading: false,
          },
        },
      },
    );
    expect(screen.getByTestId("task-details-dialog")).toHaveAttribute(
      "data-readonly",
      "true",
    );
  });

  it("passes readOnly=false when the user has task:write permission", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        dialogOpen={true}
        selectedTask={makeTask()}
      />,
      {
        preloadedState: {
          auth: {
            user: makeUser({ permissions: { "task:write": true } }),
            token: "tok",
            loading: false,
          },
        },
      },
    );
    expect(screen.getByTestId("task-details-dialog")).toHaveAttribute(
      "data-readonly",
      "false",
    );
  });

  it("calls onCloseDialog when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        dialogOpen={true}
        selectedTask={makeTask()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Close Task Dialog" }));
    expect(closedProps.onCloseDialog).toHaveBeenCalledTimes(1);
  });
});

// ── UserStoryDialog ────────────────────────────────────────────────────────────

describe("ProjectsDialogs — UserStoryDialog", () => {
  it("renders when userStoryDialogOpen=true", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        userStoryDialogOpen={true}
        sprints={[makeSprint()]}
      />,
    );
    expect(screen.getByTestId("user-story-dialog")).toBeInTheDocument();
  });

  it("does not render when userStoryDialogOpen=false", () => {
    renderWithProviders(<ProjectsDialogs {...closedProps} />);
    expect(screen.queryByTestId("user-story-dialog")).not.toBeInTheDocument();
  });

  it("calls onCloseUserStoryDialog when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        userStoryDialogOpen={true}
        sprints={[makeSprint()]}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Close Story Dialog" }),
    );
    expect(closedProps.onCloseUserStoryDialog).toHaveBeenCalledTimes(1);
  });
});

// ── SprintDialog ───────────────────────────────────────────────────────────────

describe("ProjectsDialogs — SprintDialog", () => {
  it("renders when sprintDialogOpen=true", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        sprintDialogOpen={true}
        projects={[makeProject()]}
      />,
    );
    expect(screen.getByTestId("sprint-dialog")).toBeInTheDocument();
  });

  it("does not render when sprintDialogOpen=false", () => {
    renderWithProviders(<ProjectsDialogs {...closedProps} />);
    expect(screen.queryByTestId("sprint-dialog")).not.toBeInTheDocument();
  });

  it("calls onCloseSprintDialog when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        sprintDialogOpen={true}
        projects={[makeProject()]}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Close Sprint Dialog" }),
    );
    expect(closedProps.onCloseSprintDialog).toHaveBeenCalledTimes(1);
  });
});

// ── DeleteConfirmDialog ────────────────────────────────────────────────────────

describe("ProjectsDialogs — DeleteConfirmDialog", () => {
  const story = makeUserStory({ id: "us-1", title: "Feature A" });

  it("renders when deleteStoryConfirmOpen=true", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        deleteStoryConfirmOpen={true}
        pendingDeleteStoryId="us-1"
        userStories={[story]}
      />,
    );
    expect(screen.getByTestId("delete-story-dialog")).toBeInTheDocument();
  });

  it("does not render when deleteStoryConfirmOpen=false", () => {
    renderWithProviders(<ProjectsDialogs {...closedProps} />);
    expect(screen.queryByTestId("delete-story-dialog")).not.toBeInTheDocument();
  });

  it("passes the matching story title as itemName", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        deleteStoryConfirmOpen={true}
        pendingDeleteStoryId="us-1"
        userStories={[story]}
      />,
    );
    expect(screen.getByTestId("delete-story-dialog")).toHaveAttribute(
      "data-itemname",
      "Feature A",
    );
  });

  it("passes empty itemName when pendingDeleteStoryId does not match any story", () => {
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        deleteStoryConfirmOpen={true}
        pendingDeleteStoryId="no-match"
        userStories={[story]}
      />,
    );
    expect(screen.getByTestId("delete-story-dialog")).toHaveAttribute(
      "data-itemname",
      "",
    );
  });

  it("calls onCloseDeleteStory when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        deleteStoryConfirmOpen={true}
        userStories={[]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Cancel Delete" }));
    expect(closedProps.onCloseDeleteStory).toHaveBeenCalledTimes(1);
  });

  it("calls onConfirmDeleteStory when Confirm is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectsDialogs
        {...closedProps}
        deleteStoryConfirmOpen={true}
        userStories={[]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Confirm Delete" }));
    expect(closedProps.onConfirmDeleteStory).toHaveBeenCalledTimes(1);
  });
});

// ── AddProjectDialog ───────────────────────────────────────────────────────────

describe("ProjectsDialogs — AddProjectDialog", () => {
  it("renders when addProjectDialogOpen=true", () => {
    renderWithProviders(
      <ProjectsDialogs {...closedProps} addProjectDialogOpen={true} />,
    );
    expect(screen.getByTestId("add-project-dialog")).toBeInTheDocument();
  });

  it("does not render when addProjectDialogOpen=false", () => {
    renderWithProviders(<ProjectsDialogs {...closedProps} />);
    expect(screen.queryByTestId("add-project-dialog")).not.toBeInTheDocument();
  });

  it("calls onCloseAddProject when the close button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectsDialogs {...closedProps} addProjectDialogOpen={true} />,
    );
    await user.click(screen.getByRole("button", { name: "Close Add Project" }));
    expect(closedProps.onCloseAddProject).toHaveBeenCalledTimes(1);
  });

  it("calls onProjectCreated when the project-created event fires", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <ProjectsDialogs {...closedProps} addProjectDialogOpen={true} />,
    );
    await user.click(screen.getByRole("button", { name: "Project Created" }));
    expect(closedProps.onProjectCreated).toHaveBeenCalledTimes(1);
  });
});

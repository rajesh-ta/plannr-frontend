import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserStoryRow from "@/components/projects/UserStoryRow";
import { renderWithProviders, makeUser } from "../../test-utils";
import type { UserStory } from "@/services/api/userStories";
import type { Task } from "@/services/api/tasks";
import type { User } from "@/services/api/users";

// ── Stubs ─────────────────────────────────────────────────────────────────────

jest.mock("@/components/sprint/TaskCard", () => ({
  __esModule: true,
  default: ({ task }: { task: { title: string; id: string } }) => (
    <div data-testid={`task-card-${task.id}`}>{task.title}</div>
  ),
}));

// ── Factories ─────────────────────────────────────────────────────────────────

function makeStory(overrides: Partial<UserStory> = {}): UserStory {
  return {
    id: "us-1",
    title: "My User Story",
    sprint_id: "sp-1",
    status: "new",
    created_at: "",
    user_story_no: "US-001",
    description: "A test description",
    assignee_id: undefined,
    ...overrides,
  };
}

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

function makeUserRecord(overrides: Partial<User> = {}): User {
  return {
    id: "u-1",
    name: "Bob Jones",
    email: "bob@example.com",
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

// ── Permission presets ────────────────────────────────────────────────────────

const withAllPermissions = {
  preloadedState: {
    auth: {
      user: makeUser({
        permissions: { "story:write": true, "task:write": true },
      }),
      token: "tok",
      loading: false,
    },
  },
};

const withNoPermissions = {
  preloadedState: {
    auth: {
      user: makeUser({ permissions: {} }),
      token: "tok",
      loading: false,
    },
  },
};

const withOnlyStoryWrite = {
  preloadedState: {
    auth: {
      user: makeUser({ permissions: { "story:write": true } }),
      token: "tok",
      loading: false,
    },
  },
};

// ── Base props (collapsed, no tasks, no menu open) ────────────────────────────

const baseProps = {
  story: makeStory(),
  tasks: [],
  loadingTasks: false,
  isExpanded: false,
  users: [],
  storyMenuAnchor: null,
  storyMenuId: null,
  onToggle: jest.fn(),
  onTaskClick: jest.fn(),
  onAddTask: jest.fn(),
  onDeleteTask: jest.fn(),
  onStoryMenuOpen: jest.fn(),
  onStoryMenuClose: jest.fn(),
  onEditStory: jest.fn(),
  onDeleteStoryRequest: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

// ── Story title and toggle ─────────────────────────────────────────────────────

describe("UserStoryRow — story title and toggle", () => {
  it("always renders the story title", () => {
    renderWithProviders(<UserStoryRow {...baseProps} />);
    expect(screen.getByText("My User Story")).toBeInTheDocument();
  });

  it("calls onToggle with the story id when the title area is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserStoryRow {...baseProps} />);
    await user.click(screen.getByText("My User Story"));
    expect(baseProps.onToggle).toHaveBeenCalledWith("us-1");
  });

  it("calls onToggle only once per click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserStoryRow {...baseProps} />);
    await user.click(screen.getByText("My User Story"));
    expect(baseProps.onToggle).toHaveBeenCalledTimes(1);
  });
});

// ── Expanded content ───────────────────────────────────────────────────────────

describe("UserStoryRow — expanded content", () => {
  const expandedProps = { ...baseProps, isExpanded: true };

  it("shows user_story_no when provided", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ user_story_no: "US-007" })}
      />,
    );
    expect(screen.getByText("US-007")).toBeInTheDocument();
  });

  it("does not show user_story_no when it is absent", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ user_story_no: undefined })}
      />,
    );
    expect(screen.queryByText(/US-/)).not.toBeInTheDocument();
  });

  it("shows description when provided", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ description: "Sprint goal detail" })}
      />,
    );
    expect(screen.getByText("Sprint goal detail")).toBeInTheDocument();
  });

  it("does not show description when it is absent", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ description: undefined })}
      />,
    );
    expect(screen.queryByText("Sprint goal detail")).not.toBeInTheDocument();
  });

  it("renders a status chip with the mapped label for a known status", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ status: "active" })}
      />,
    );
    // getUserStoryStatusStyle maps "active" → label "Active"
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders a status chip with raw status when status is unknown", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ status: "custom-status" })}
      />,
    );
    expect(screen.getByText("custom-status")).toBeInTheDocument();
  });

  it("shows the assignee name when users list contains the matching user", () => {
    const assignee = makeUserRecord({ id: "u-1", name: "Alice Wonder" });
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ assignee_id: "u-1" })}
        users={[assignee]}
      />,
    );
    expect(screen.getByText("Alice Wonder")).toBeInTheDocument();
  });

  it("shows 'Unassigned' when no user matches the assignee_id", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ assignee_id: "u-99" })}
        users={[]}
      />,
    );
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("shows 'Unassigned' when assignee_id is undefined", () => {
    renderWithProviders(
      <UserStoryRow
        {...expandedProps}
        story={makeStory({ assignee_id: undefined })}
        users={[]}
      />,
    );
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("shows 'Loading...' text in task columns when loadingTasks=true", () => {
    renderWithProviders(
      <UserStoryRow {...expandedProps} loadingTasks={true} />,
    );
    // One "Loading..." per status column (new / active / closed / removed)
    expect(screen.getAllByText("Loading...").length).toBeGreaterThanOrEqual(1);
  });

  it("renders TaskCards for tasks in the correct status groups", () => {
    const tasks = [
      makeTask({ id: "t1", title: "New Task", status: "new" }),
      makeTask({ id: "t2", title: "Active Task", status: "active" }),
      makeTask({ id: "t3", title: "Closed Task", status: "closed" }),
    ];
    renderWithProviders(
      <UserStoryRow {...expandedProps} tasks={tasks} />,
      withAllPermissions,
    );
    expect(screen.getByTestId("task-card-t1")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-t2")).toBeInTheDocument();
    expect(screen.getByTestId("task-card-t3")).toBeInTheDocument();
  });

  it("does not render TaskCards when there are no tasks", () => {
    renderWithProviders(<UserStoryRow {...expandedProps} tasks={[]} />);
    expect(screen.queryByTestId(/task-card-/)).not.toBeInTheDocument();
  });
});

// ── Add Task button ────────────────────────────────────────────────────────────

describe("UserStoryRow — Add Task button", () => {
  const expandedProps = { ...baseProps, isExpanded: true };

  it("shows Add Task button when user has task:write permission", () => {
    renderWithProviders(
      <UserStoryRow {...expandedProps} />,
      withAllPermissions,
    );
    expect(
      screen.getByRole("button", { name: /add task/i }),
    ).toBeInTheDocument();
  });

  it("hides Add Task button when user lacks task:write permission", () => {
    renderWithProviders(<UserStoryRow {...expandedProps} />, withNoPermissions);
    expect(
      screen.queryByRole("button", { name: /add task/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onAddTask with the story id when the button is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserStoryRow {...expandedProps} />,
      withAllPermissions,
    );
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(baseProps.onAddTask).toHaveBeenCalledWith("us-1");
  });
});

// ── Story context menu ─────────────────────────────────────────────────────────

describe("UserStoryRow — story context menu button", () => {
  it("renders the MoreVert menu button when user has story:write permission", () => {
    const { container } = renderWithProviders(
      <UserStoryRow {...baseProps} />,
      withOnlyStoryWrite,
    );
    expect(container.querySelector(".story-menu-btn")).toBeInTheDocument();
  });

  it("does not render the MoreVert button without story:write permission", () => {
    const { container } = renderWithProviders(
      <UserStoryRow {...baseProps} />,
      withNoPermissions,
    );
    expect(container.querySelector(".story-menu-btn")).not.toBeInTheDocument();
  });

  it("calls onStoryMenuOpen with the event and story id when clicked", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <UserStoryRow {...baseProps} />,
      withOnlyStoryWrite,
    );
    const menuBtn = container.querySelector(".story-menu-btn") as HTMLElement;
    await user.click(menuBtn);
    expect(baseProps.onStoryMenuOpen).toHaveBeenCalledWith(
      expect.any(Object),
      "us-1",
    );
  });
});

// ── Story context menu items ───────────────────────────────────────────────────

describe("UserStoryRow — story context menu items", () => {
  // Open the menu by providing a non-null anchor and matching storyMenuId
  const openMenuProps = {
    ...baseProps,
    storyMenuAnchor: document.body,
    storyMenuId: "us-1",
  };

  it("renders Edit and Delete menu items when the menu is open", () => {
    renderWithProviders(
      <UserStoryRow {...openMenuProps} />,
      withAllPermissions,
    );
    expect(screen.getByRole("menuitem", { name: /edit/i })).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /delete/i }),
    ).toBeInTheDocument();
  });

  it("does not render menu items without story:write permission", () => {
    renderWithProviders(<UserStoryRow {...openMenuProps} />, withNoPermissions);
    expect(
      screen.queryByRole("menuitem", { name: /edit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onEditStory when the Edit menu item is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserStoryRow {...openMenuProps} />,
      withAllPermissions,
    );
    await user.click(screen.getByRole("menuitem", { name: /edit/i }));
    expect(baseProps.onEditStory).toHaveBeenCalledTimes(1);
  });

  it("calls onDeleteStoryRequest when the Delete menu item is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <UserStoryRow {...openMenuProps} />,
      withAllPermissions,
    );
    await user.click(screen.getByRole("menuitem", { name: /delete/i }));
    expect(baseProps.onDeleteStoryRequest).toHaveBeenCalledTimes(1);
  });

  it("does not show menu items when storyMenuId does not match the story id", () => {
    renderWithProviders(
      <UserStoryRow
        {...baseProps}
        storyMenuAnchor={document.body}
        storyMenuId="different-id"
      />,
      withAllPermissions,
    );
    expect(
      screen.queryByRole("menuitem", { name: /edit/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /delete/i }),
    ).not.toBeInTheDocument();
  });

  it("does not show menu items when storyMenuAnchor is null", () => {
    renderWithProviders(
      <UserStoryRow {...baseProps} storyMenuAnchor={null} storyMenuId="us-1" />,
      withAllPermissions,
    );
    expect(
      screen.queryByRole("menuitem", { name: /edit/i }),
    ).not.toBeInTheDocument();
  });
});

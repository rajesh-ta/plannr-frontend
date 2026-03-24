import { renderHook, waitFor, act } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { useProjectsData } from "@/hooks/useProjectsData";
import { projectsApi } from "@/services/api/projects";
import { sprintsApi } from "@/services/api/sprints";
import { userStoriesApi } from "@/services/api/userStories";
import { tasksApi } from "@/services/api/tasks";
import { makeStore } from "../test-utils";
import type { Task } from "@/services/api/tasks";
import type { UserStory } from "@/services/api/userStories";
import type { Sprint } from "@/services/api/sprints";
import type { Project } from "@/services/api/projects";

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock("@/services/api/projects");
jest.mock("@/services/api/sprints");
jest.mock("@/services/api/userStories");
jest.mock("@/services/api/tasks");
jest.mock("@/hooks/useUsers", () => ({
  useUsers: jest.fn(() => ({ data: [] })),
  useUserById: jest.fn(),
}));

const mockedProjectsApi = projectsApi as jest.Mocked<typeof projectsApi>;
const mockedSprintsApi = sprintsApi as jest.Mocked<typeof sprintsApi>;
const mockedUserStoriesApi = userStoriesApi as jest.Mocked<
  typeof userStoriesApi
>;
const mockedTasksApi = tasksApi as jest.Mocked<typeof tasksApi>;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const PROJECT: Project = {
  id: "p1",
  name: "Alpha",
  description: "",
  created_at: "",
};
const PROJECT_2: Project = {
  id: "p2",
  name: "Beta",
  description: "",
  created_at: "",
};
const SPRINT: Sprint = {
  id: "sp1",
  name: "Sprint 1",
  project_id: "p1",
  status: "active",
  created_at: "",
};
const USER_STORY: UserStory = {
  id: "us1",
  title: "Story One",
  sprint_id: "sp1",
  status: "new",
  created_at: "",
};
const TASK: Task = {
  id: "t1",
  task_no: "T-001",
  title: "Task One",
  user_story_id: "us1",
  status: "new",
  created_at: "",
};

// ── Helper — wrapper + settle ─────────────────────────────────────────────────

function makeWrapper() {
  const store = makeStore();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      Provider,
      { store },
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children,
      ),
    );
  }
  return { store, Wrapper };
}

/**
 * Renders the hook and waits for the full cascade
 * (projects → sprints → stories → auto-load tasks) to settle.
 */
async function renderAndSettle() {
  const { store, Wrapper } = makeWrapper();
  const { result } = renderHook(() => useProjectsData(), { wrapper: Wrapper });
  await waitFor(() => {
    expect(result.current.loadingProjects).toBe(false);
    expect(result.current.loadingSprints).toBe(false);
    expect(result.current.loadingUserStories).toBe(false);
    // tasks for the only user story are auto-loaded
    expect(result.current.storyTasks["us1"]).toBeDefined();
  });
  return { result, store };
}

// ── Fake mouse event for menu handlers ───────────────────────────────────────

function fakeMouse(target: HTMLElement = document.body) {
  return {
    currentTarget: target,
    stopPropagation: jest.fn(),
  } as unknown as React.MouseEvent<HTMLElement>;
}

// ── Default mock values installed before every test ───────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockedProjectsApi.getAll.mockResolvedValue([PROJECT]);
  mockedSprintsApi.getByProjectId.mockResolvedValue([SPRINT]);
  mockedUserStoriesApi.getBySprintId.mockResolvedValue([USER_STORY]);
  mockedTasksApi.getByUserStoryId.mockResolvedValue([TASK]);
  mockedSprintsApi.create.mockResolvedValue(SPRINT);
  mockedUserStoriesApi.create.mockResolvedValue(USER_STORY);
  mockedUserStoriesApi.update.mockResolvedValue({
    ...USER_STORY,
    title: "Updated Story",
  });
  (mockedUserStoriesApi.delete as jest.Mock).mockResolvedValue(undefined);
  mockedTasksApi.create.mockResolvedValue(TASK);
  mockedTasksApi.update.mockResolvedValue({ ...TASK, title: "Updated Task" });
  (mockedTasksApi.delete as jest.Mock).mockResolvedValue(undefined);
});

// ── Initial data loading ──────────────────────────────────────────────────────

describe("useProjectsData — initial data loading", () => {
  it("starts with loadingProjects=true and an empty projects list", () => {
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useProjectsData(), {
      wrapper: Wrapper,
    });
    expect(result.current.loadingProjects).toBe(true);
    expect(result.current.projects).toEqual([]);
  });

  it("fetches projects on mount and populates the list", async () => {
    const { result } = await renderAndSettle();
    expect(mockedProjectsApi.getAll).toHaveBeenCalledTimes(1);
    expect(result.current.projects).toEqual([PROJECT]);
  });

  it("auto-selects the first project when none was previously selected", async () => {
    const { result } = await renderAndSettle();
    expect(result.current.selectedProjectId).toBe("p1");
  });

  it("fetches sprints for the selected project and auto-selects the first", async () => {
    const { result } = await renderAndSettle();
    expect(mockedSprintsApi.getByProjectId).toHaveBeenCalledWith("p1");
    expect(result.current.sprints).toEqual([SPRINT]);
    expect(result.current.selectedSprintId).toBe("sp1");
  });

  it("fetches user stories for the selected sprint", async () => {
    const { result } = await renderAndSettle();
    expect(mockedUserStoriesApi.getBySprintId).toHaveBeenCalledWith("sp1");
    expect(result.current.userStories).toEqual([USER_STORY]);
  });

  it("auto-loads tasks for every user story once stories are fetched", async () => {
    const { result } = await renderAndSettle();
    expect(mockedTasksApi.getByUserStoryId).toHaveBeenCalledWith("us1");
    expect(result.current.storyTasks["us1"]).toEqual([TASK]);
  });

  it("clears userStories and skips downstream fetches when no sprint is available", async () => {
    mockedProjectsApi.getAll.mockResolvedValue([]);
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useProjectsData(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loadingProjects).toBe(false));
    expect(result.current.userStories).toEqual([]);
    expect(mockedUserStoriesApi.getBySprintId).not.toHaveBeenCalled();
  });

  it("handles project fetch failure — projects stays empty, loadingProjects=false", async () => {
    mockedProjectsApi.getAll.mockRejectedValueOnce(new Error("Network error"));
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useProjectsData(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loadingProjects).toBe(false));
    expect(result.current.projects).toEqual([]);
  });

  it("handles sprint fetch failure — clears sprints, resets sprint selection", async () => {
    mockedSprintsApi.getByProjectId.mockRejectedValueOnce(
      new Error("Network error"),
    );
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useProjectsData(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loadingProjects).toBe(false));
    await waitFor(() => expect(result.current.loadingSprints).toBe(false));
    expect(result.current.sprints).toEqual([]);
    expect(result.current.selectedSprintId).toBe("");
  });

  it("handles user story fetch failure — clears userStories", async () => {
    mockedUserStoriesApi.getBySprintId.mockRejectedValueOnce(
      new Error("Network error"),
    );
    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useProjectsData(), {
      wrapper: Wrapper,
    });
    await waitFor(() => expect(result.current.loadingProjects).toBe(false));
    await waitFor(() => expect(result.current.loadingSprints).toBe(false));
    await waitFor(() => expect(result.current.loadingUserStories).toBe(false));
    expect(result.current.userStories).toEqual([]);
  });
});

// ── handleCollapseAll ─────────────────────────────────────────────────────────

describe("useProjectsData — handleCollapseAll", () => {
  it("collapses all stories and sets allCollapsed=true when called with allCollapsed=false", async () => {
    const { result } = await renderAndSettle();
    // Expand a story first so there is something to collapse
    await act(async () => {
      await result.current.toggleStory("us1");
    });
    expect(result.current.expandedStories["us1"]).toBe(true);

    act(() => result.current.handleCollapseAll());
    expect(result.current.allCollapsed).toBe(true);
    expect(result.current.expandedStories).toEqual({});
  });

  it("expands all user stories and sets allCollapsed=false when called with allCollapsed=true", async () => {
    const { result } = await renderAndSettle();
    // First call → collapse all
    act(() => result.current.handleCollapseAll());
    expect(result.current.allCollapsed).toBe(true);
    // Second call → expand all
    act(() => result.current.handleCollapseAll());
    expect(result.current.allCollapsed).toBe(false);
    expect(result.current.expandedStories["us1"]).toBe(true);
  });

  it("toggles allCollapsed on successive calls", async () => {
    const { result } = await renderAndSettle();
    expect(result.current.allCollapsed).toBe(false);
    act(() => result.current.handleCollapseAll());
    expect(result.current.allCollapsed).toBe(true);
    act(() => result.current.handleCollapseAll());
    expect(result.current.allCollapsed).toBe(false);
  });
});

// ── toggleStory ───────────────────────────────────────────────────────────────

describe("useProjectsData — toggleStory", () => {
  it("marks the story as expanded when toggled from collapsed state", async () => {
    const { result } = await renderAndSettle();
    await act(async () => {
      await result.current.toggleStory("us1");
    });
    expect(result.current.expandedStories["us1"]).toBe(true);
  });

  it("marks the story as collapsed when toggled from expanded state", async () => {
    const { result } = await renderAndSettle();
    await act(async () => {
      await result.current.toggleStory("us1");
    });
    await act(async () => {
      await result.current.toggleStory("us1");
    });
    expect(result.current.expandedStories["us1"]).toBe(false);
  });

  it("does NOT re-fetch tasks when the story's tasks are already loaded", async () => {
    const { result } = await renderAndSettle();
    // "us1" tasks are populated by auto-load
    expect(result.current.storyTasks["us1"]).toBeDefined();
    const callsBefore = mockedTasksApi.getByUserStoryId.mock.calls.length;
    await act(async () => {
      await result.current.toggleStory("us1");
    });
    expect(mockedTasksApi.getByUserStoryId).toHaveBeenCalledTimes(callsBefore);
  });

  it("does not trigger additional task fetches when toggling a story not in userStories", async () => {
    const { result } = await renderAndSettle();
    // "us2" is not in userStories; useQueries only pre-fetches for known stories
    expect(result.current.storyTasks["us2"]).toBeUndefined();
    const callsBefore = mockedTasksApi.getByUserStoryId.mock.calls.length;
    await act(async () => {
      await result.current.toggleStory("us2");
    });
    expect(result.current.expandedStories["us2"]).toBe(true);
    // no extra fetch — useQueries drives task loading, not toggleStory
    expect(mockedTasksApi.getByUserStoryId).toHaveBeenCalledTimes(callsBefore);
    expect(result.current.storyTasks["us2"]).toBeUndefined();
  });
});

// ── Task dialog handlers ──────────────────────────────────────────────────────

describe("useProjectsData — task dialog handlers", () => {
  it("handleTaskClick sets selectedTask and opens dialogOpen", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleTaskClick(TASK));
    expect(result.current.selectedTask).toEqual(TASK);
    expect(result.current.dialogOpen).toBe(true);
  });

  it("handleCloseDialog closes the dialog and clears selectedTask", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleTaskClick(TASK));
    act(() => result.current.handleCloseDialog());
    expect(result.current.dialogOpen).toBe(false);
    expect(result.current.selectedTask).toBeNull();
  });

  it("handleCloseDialog also clears addingTaskForStory", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleAddTask("us1"));
    expect(result.current.addingTaskForStory).toBe("us1");
    act(() => result.current.handleCloseDialog());
    expect(result.current.addingTaskForStory).toBeNull();
    expect(result.current.dialogOpen).toBe(false);
  });

  it("handleAddTask sets addingTaskForStory, clears selectedTask, and opens dialog", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleTaskClick(TASK)); // set selectedTask first
    act(() => result.current.handleAddTask("us1"));
    expect(result.current.addingTaskForStory).toBe("us1");
    expect(result.current.selectedTask).toBeNull();
    expect(result.current.dialogOpen).toBe(true);
  });

  it("getSelectedUserStory returns the story for addingTaskForStory when set", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleAddTask("us1"));
    expect(result.current.getSelectedUserStory()).toEqual(USER_STORY);
  });

  it("getSelectedUserStory returns the story matching selectedTask.user_story_id", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleTaskClick(TASK)); // TASK.user_story_id = "us1"
    expect(result.current.getSelectedUserStory()).toEqual(USER_STORY);
  });

  it("getSelectedUserStory returns null when neither addingTaskForStory nor selectedTask is set", async () => {
    const { result } = await renderAndSettle();
    expect(result.current.getSelectedUserStory()).toBeNull();
  });
});

// ── handleSaveTask ────────────────────────────────────────────────────────────

describe("useProjectsData — handleSaveTask", () => {
  it("calls tasksApi.create and appends the task to storyTasks when addingTaskForStory is set", async () => {
    const { result } = await renderAndSettle();
    const createdTask: Task = { ...TASK, id: "t-new", title: "New Task" };
    mockedTasksApi.create.mockResolvedValueOnce(createdTask);
    mockedTasksApi.getByUserStoryId.mockResolvedValue([TASK, createdTask]);
    act(() => result.current.handleAddTask("us1"));
    await act(async () => {
      await result.current.handleSaveTask({
        title: "New Task",
        description: "Detail",
        status: "new",
      });
    });
    expect(mockedTasksApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ user_story_id: "us1", title: "New Task" }),
    );
    await waitFor(() =>
      expect(result.current.storyTasks["us1"]).toContainEqual(createdTask),
    );
  });

  it("calls tasksApi.update and replaces the task in storyTasks when selectedTask is set", async () => {
    const { result } = await renderAndSettle();
    const updatedTask: Task = { ...TASK, title: "Updated Task" };
    mockedTasksApi.update.mockResolvedValueOnce(updatedTask);
    mockedTasksApi.getByUserStoryId.mockResolvedValue([updatedTask]);
    act(() => result.current.handleTaskClick(TASK));
    await act(async () => {
      await result.current.handleSaveTask({ title: "Updated Task" });
    });
    expect(mockedTasksApi.update).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({ title: "Updated Task" }),
    );
    await waitFor(() => {
      expect(result.current.storyTasks["us1"]).toContainEqual(updatedTask);
      expect(result.current.storyTasks["us1"]).not.toContainEqual(
        expect.objectContaining({ title: "Task One" }),
      );
    });
  });

  it("does not call any API when neither addingTaskForStory nor selectedTask is set", async () => {
    const { result } = await renderAndSettle();
    await act(async () => {
      await result.current.handleSaveTask({ title: "Test" });
    });
    expect(mockedTasksApi.create).not.toHaveBeenCalled();
    expect(mockedTasksApi.update).not.toHaveBeenCalled();
  });

  it("handles tasksApi.create rejection without throwing", async () => {
    mockedTasksApi.create.mockRejectedValueOnce(new Error("Server error"));
    const { result } = await renderAndSettle();
    act(() => result.current.handleAddTask("us1"));
    await expect(
      act(async () => {
        await result.current.handleSaveTask({
          title: "New Task",
          description: "Detail",
          status: "new",
        });
      }),
    ).resolves.not.toThrow();
  });
});

// ── handleDeleteTask ──────────────────────────────────────────────────────────

describe("useProjectsData — handleDeleteTask", () => {
  it("calls tasksApi.delete and removes the task from storyTasks", async () => {
    const { result } = await renderAndSettle();
    // storyTasks["us1"] = [TASK] after auto-load
    mockedTasksApi.getByUserStoryId.mockResolvedValue([]);
    await act(async () => {
      await result.current.handleDeleteTask("t1");
    });
    expect(mockedTasksApi.delete).toHaveBeenCalledWith("t1");
    await waitFor(() => expect(result.current.storyTasks["us1"]).toEqual([]));
  });

  it("does nothing when the task id is not found in any story's tasks", async () => {
    const { result } = await renderAndSettle();
    await act(async () => {
      await result.current.handleDeleteTask("no-such-task");
    });
    expect(mockedTasksApi.delete).not.toHaveBeenCalled();
  });

  it("handles tasksApi.delete rejection without throwing", async () => {
    (mockedTasksApi.delete as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );
    const { result } = await renderAndSettle();
    await expect(
      act(async () => {
        await result.current.handleDeleteTask("t1");
      }),
    ).resolves.not.toThrow();
  });
});

// ── handleSaveUserStory ───────────────────────────────────────────────────────

describe("useProjectsData — handleSaveUserStory", () => {
  const STORY_PAYLOAD = { sprint_id: "sp1", title: "New Story", status: "new" };

  it("calls userStoriesApi.create and appends the story when its sprint matches selectedSprintId", async () => {
    const { result } = await renderAndSettle();
    const newStory: UserStory = {
      ...USER_STORY,
      id: "us2",
      title: "New Story",
    };
    mockedUserStoriesApi.create.mockResolvedValueOnce(newStory);
    mockedUserStoriesApi.getBySprintId.mockResolvedValueOnce([
      USER_STORY,
      newStory,
    ]);
    await act(async () => {
      await result.current.handleSaveUserStory(STORY_PAYLOAD);
    });
    expect(mockedUserStoriesApi.create).toHaveBeenCalledWith(STORY_PAYLOAD);
    await waitFor(() =>
      expect(result.current.userStories).toContainEqual(newStory),
    );
  });

  it("does NOT append the story when its sprint_id differs from selectedSprintId", async () => {
    const { result } = await renderAndSettle();
    const otherStory: UserStory = {
      ...USER_STORY,
      id: "us3",
      sprint_id: "sp99",
    };
    mockedUserStoriesApi.create.mockResolvedValueOnce(otherStory);
    const before = result.current.userStories.length;
    await act(async () => {
      await result.current.handleSaveUserStory({
        ...STORY_PAYLOAD,
        sprint_id: "sp99",
      });
    });
    expect(result.current.userStories.length).toBe(before);
  });

  it("calls userStoriesApi.update and replaces the story in the list when id is provided", async () => {
    const { result } = await renderAndSettle();
    const updatedStory: UserStory = { ...USER_STORY, title: "Updated Story" };
    mockedUserStoriesApi.update.mockResolvedValueOnce(updatedStory);
    mockedUserStoriesApi.getBySprintId.mockResolvedValueOnce([updatedStory]);
    await act(async () => {
      await result.current.handleSaveUserStory(STORY_PAYLOAD, "us1");
    });
    expect(mockedUserStoriesApi.update).toHaveBeenCalledWith(
      "us1",
      STORY_PAYLOAD,
    );
    await waitFor(() => {
      expect(result.current.userStories).toContainEqual(updatedStory);
      expect(result.current.userStories).not.toContainEqual(USER_STORY);
    });
  });
});

// ── Story menu handlers ───────────────────────────────────────────────────────

describe("useProjectsData — story menu handlers", () => {
  it("handleStoryMenuOpen sets storyMenuId and storyMenuAnchor", async () => {
    const { result } = await renderAndSettle();
    const btn = document.createElement("button");
    act(() => result.current.handleStoryMenuOpen(fakeMouse(btn), "us1"));
    expect(result.current.storyMenuId).toBe("us1");
    expect(result.current.storyMenuAnchor).toBe(btn);
  });

  it("handleStoryMenuClose clears storyMenuAnchor and storyMenuId", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleStoryMenuOpen(fakeMouse(), "us1"));
    act(() => result.current.handleStoryMenuClose());
    expect(result.current.storyMenuAnchor).toBeNull();
    expect(result.current.storyMenuId).toBeNull();
  });

  it("handleEditStory sets editingUserStory, opens userStoryDialog, and closes the menu", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleStoryMenuOpen(fakeMouse(), "us1"));
    act(() => result.current.handleEditStory());
    expect(result.current.editingUserStory).toEqual(USER_STORY);
    expect(result.current.userStoryDialogOpen).toBe(true);
    expect(result.current.storyMenuAnchor).toBeNull();
    expect(result.current.storyMenuId).toBeNull();
  });

  it("handleEditStory does nothing when storyMenuId does not match any story", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleStoryMenuOpen(fakeMouse(), "no-such-story"));
    act(() => result.current.handleEditStory());
    expect(result.current.editingUserStory).toBeNull();
    expect(result.current.userStoryDialogOpen).toBe(false);
  });

  it("handleDeleteStoryRequest sets pendingDeleteStoryId, opens confirm dialog, and closes menu", async () => {
    const { result } = await renderAndSettle();
    act(() => result.current.handleStoryMenuOpen(fakeMouse(), "us1"));
    act(() => result.current.handleDeleteStoryRequest());
    expect(result.current.pendingDeleteStoryId).toBe("us1");
    expect(result.current.deleteStoryConfirmOpen).toBe(true);
    expect(result.current.storyMenuAnchor).toBeNull();
    expect(result.current.storyMenuId).toBeNull();
  });
});

// ── handleDeleteStory ─────────────────────────────────────────────────────────

describe("useProjectsData — handleDeleteStory", () => {
  it("calls userStoriesApi.delete, removes the story from the list and clears its tasks", async () => {
    const { result } = await renderAndSettle();
    // Trigger the delete request flow via menu
    mockedUserStoriesApi.getBySprintId.mockResolvedValueOnce([]);
    act(() => result.current.handleStoryMenuOpen(fakeMouse(), "us1"));
    act(() => result.current.handleDeleteStoryRequest());
    await act(async () => {
      await result.current.handleDeleteStory();
    });
    expect(mockedUserStoriesApi.delete).toHaveBeenCalledWith("us1");
    await waitFor(() => {
      expect(result.current.userStories).toEqual([]);
      expect(result.current.storyTasks["us1"]).toBeUndefined();
    });
  });

  it("does nothing when pendingDeleteStoryId is null", async () => {
    const { result } = await renderAndSettle();
    expect(result.current.pendingDeleteStoryId).toBeNull();
    await act(async () => {
      await result.current.handleDeleteStory();
    });
    expect(mockedUserStoriesApi.delete).not.toHaveBeenCalled();
  });

  it("handles userStoriesApi.delete rejection without throwing", async () => {
    (mockedUserStoriesApi.delete as jest.Mock).mockRejectedValueOnce(
      new Error("Server error"),
    );
    const { result } = await renderAndSettle();
    act(() => result.current.handleStoryMenuOpen(fakeMouse(), "us1"));
    act(() => result.current.handleDeleteStoryRequest());
    await expect(
      act(async () => {
        await result.current.handleDeleteStory();
      }),
    ).resolves.not.toThrow();
  });
});

// ── handleSaveSprint ──────────────────────────────────────────────────────────

describe("useProjectsData — handleSaveSprint", () => {
  it("creates a sprint for the current project, adds it to the list, and selects it", async () => {
    const { result } = await renderAndSettle();
    const newSprint: Sprint = {
      id: "sp2",
      name: "Sprint 2",
      project_id: "p1",
      status: "active",
      created_at: "",
    };
    mockedSprintsApi.create.mockResolvedValueOnce(newSprint);
    mockedSprintsApi.getByProjectId.mockResolvedValueOnce([SPRINT, newSprint]);
    await act(async () => {
      await result.current.handleSaveSprint({
        name: "Sprint 2",
        project_id: "p1",
        status: "active",
      });
    });
    expect(mockedSprintsApi.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Sprint 2", project_id: "p1" }),
    );
    await waitFor(() => {
      expect(result.current.sprints).toContainEqual(newSprint);
      expect(result.current.selectedSprintId).toBe("sp2");
    });
  });

  it("switches selectedProjectId when the sprint belongs to a different project", async () => {
    const { result } = await renderAndSettle();
    const newSprint: Sprint = {
      id: "sp-p2",
      name: "Sprint Beta",
      project_id: "p2",
      status: "active",
      created_at: "",
    };
    mockedSprintsApi.create.mockResolvedValueOnce(newSprint);
    mockedSprintsApi.getByProjectId.mockResolvedValue([newSprint]);
    mockedUserStoriesApi.getBySprintId.mockResolvedValue([]);
    await act(async () => {
      await result.current.handleSaveSprint({
        name: "Sprint Beta",
        project_id: "p2",
        status: "active",
      });
    });
    await waitFor(() => expect(result.current.selectedProjectId).toBe("p2"));
  });
});

// ── handleProjectCreated ──────────────────────────────────────────────────────

describe("useProjectsData — handleProjectCreated", () => {
  it("re-fetches projects and updates the list", async () => {
    const { result } = await renderAndSettle();
    const freshProjects = [PROJECT, PROJECT_2];
    mockedProjectsApi.getAll.mockResolvedValueOnce(freshProjects);
    await act(async () => {
      await result.current.handleProjectCreated();
    });
    expect(mockedProjectsApi.getAll).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.projects).toEqual(freshProjects));
  });

  it("selects the first project from the refreshed list", async () => {
    const { result } = await renderAndSettle();
    // Put a different project first so the selection change is observable
    mockedProjectsApi.getAll.mockResolvedValueOnce([PROJECT_2, PROJECT]);
    mockedSprintsApi.getByProjectId.mockResolvedValue([]);
    mockedUserStoriesApi.getBySprintId.mockResolvedValue([]);
    await act(async () => {
      await result.current.handleProjectCreated();
    });
    await waitFor(() => expect(result.current.selectedProjectId).toBe("p2"));
  });

  it("does not throw when the refreshed project list is empty", async () => {
    const { result } = await renderAndSettle();
    mockedProjectsApi.getAll.mockResolvedValueOnce([]);
    await expect(
      act(async () => {
        await result.current.handleProjectCreated();
      }),
    ).resolves.not.toThrow();
  });
});

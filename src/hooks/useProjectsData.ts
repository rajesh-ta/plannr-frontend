import { useState, useEffect, useCallback, useRef } from "react";
import { useProject } from "@/hooks/useProject";
import { projectsApi, Project } from "@/services/api/projects";
import {
  sprintsApi,
  Sprint,
  SprintCreatePayload,
} from "@/services/api/sprints";
import {
  userStoriesApi,
  UserStory,
  UserStoryCreatePayload,
} from "@/services/api/userStories";
import { tasksApi, Task } from "@/services/api/tasks";
import { useUsers } from "@/hooks/useUsers";

export function useProjectsData() {
  const {
    selectedProjectId,
    setSelectedProjectId,
    selectedSprintId,
    setSelectedSprintId,
  } = useProject();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);

  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [loadingUserStories, setLoadingUserStories] = useState(false);

  const [expandedStories, setExpandedStories] = useState<
    Record<string, boolean>
  >({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [storyTasks, setStoryTasks] = useState<Record<string, Task[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});

  // Dialog / menu state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingTaskForStory, setAddingTaskForStory] = useState<string | null>(
    null,
  );
  const [newWorkItemAnchor, setNewWorkItemAnchor] =
    useState<null | HTMLElement>(null);
  const [userStoryDialogOpen, setUserStoryDialogOpen] = useState(false);
  const [editingUserStory, setEditingUserStory] = useState<UserStory | null>(
    null,
  );
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [storyMenuAnchor, setStoryMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [storyMenuId, setStoryMenuId] = useState<string | null>(null);
  const [deleteStoryConfirmOpen, setDeleteStoryConfirmOpen] = useState(false);
  const [pendingDeleteStoryId, setPendingDeleteStoryId] = useState<
    string | null
  >(null);

  const { data: users = [] } = useUsers();

  // Holds a sprint ID to select after a project-switch triggered re-fetch
  const pendingSprintIdRef = useRef<string | null>(null);

  // ── Fetch projects on mount ────────────────────────────────────────────
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const data = await projectsApi.getAll();
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch sprints on project change ──────────────────────────────────
  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProjectId) return;
      try {
        setLoadingSprints(true);
        const data = await sprintsApi.getByProjectId(selectedProjectId);
        setSprints(data);
        // If we're expecting a specific sprint (e.g. just created for this project)
        const pendingId = pendingSprintIdRef.current;
        pendingSprintIdRef.current = null;
        const targetSprint = pendingId && data.find((s) => s.id === pendingId);
        setSelectedSprintId(
          targetSprint ? pendingId! : data.length > 0 ? data[0].id : "",
        );
      } catch (error) {
        console.error("Failed to fetch sprints:", error);
        setSprints([]);
        setSelectedSprintId("");
      } finally {
        setLoadingSprints(false);
      }
    };
    fetchSprints();
  }, [selectedProjectId, setSelectedSprintId]);

  // ── Fetch user stories on sprint change ──────────────────────────────
  useEffect(() => {
    const fetchUserStories = async () => {
      if (!selectedSprintId) {
        setUserStories([]);
        return;
      }
      try {
        setLoadingUserStories(true);
        const data = await userStoriesApi.getBySprintId(selectedSprintId);
        setUserStories(data);
        setExpandedStories({});
        setStoryTasks({});
        setLoadingTasks({});
      } catch (error) {
        console.error("Failed to fetch user stories:", error);
        setUserStories([]);
      } finally {
        setLoadingUserStories(false);
      }
    };
    fetchUserStories();
  }, [selectedSprintId]);

  // ── Auto-load tasks for all user stories ─────────────────────────────
  useEffect(() => {
    if (userStories.length === 0) return;
    const loadTasks = async () => {
      await Promise.all(
        userStories.map(async (story) => {
          try {
            setLoadingTasks((prev) => ({ ...prev, [story.id]: true }));
            const tasks = await tasksApi.getByUserStoryId(story.id);
            setStoryTasks((prev) =>
              prev[story.id] === undefined
                ? { ...prev, [story.id]: tasks }
                : prev,
            );
          } catch {
            setStoryTasks((prev) =>
              prev[story.id] === undefined ? { ...prev, [story.id]: [] } : prev,
            );
          } finally {
            setLoadingTasks((prev) => ({ ...prev, [story.id]: false }));
          }
        }),
      );
    };
    loadTasks();
  }, [userStories]);

  // ── Board handlers ────────────────────────────────────────────────────
  const handleCollapseAll = () => {
    if (allCollapsed) {
      const expanded: Record<string, boolean> = {};
      userStories.forEach((s) => {
        expanded[s.id] = true;
      });
      setExpandedStories(expanded);
    } else {
      setExpandedStories({});
    }
    setAllCollapsed(!allCollapsed);
  };

  const toggleStory = async (storyId: string) => {
    const isExpanding = !expandedStories[storyId];
    setExpandedStories((prev) => ({ ...prev, [storyId]: isExpanding }));
    if (isExpanding && !storyTasks[storyId]) {
      try {
        setLoadingTasks((prev) => ({ ...prev, [storyId]: true }));
        const tasks = await tasksApi.getByUserStoryId(storyId);
        setStoryTasks((prev) => ({ ...prev, [storyId]: tasks }));
      } catch {
        setStoryTasks((prev) => ({ ...prev, [storyId]: [] }));
      } finally {
        setLoadingTasks((prev) => ({ ...prev, [storyId]: false }));
      }
    }
  };

  // ── Task dialog handlers ──────────────────────────────────────────────
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const getSelectedUserStory = () => {
    if (addingTaskForStory)
      return userStories.find((s) => s.id === addingTaskForStory);
    if (!selectedTask) return null;
    return userStories.find((s) => s.id === selectedTask.user_story_id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
    setAddingTaskForStory(null);
  };

  const handleAddTask = (userStoryId: string) => {
    setAddingTaskForStory(userStoryId);
    setSelectedTask(null);
    setDialogOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (addingTaskForStory) {
        const payload = {
          user_story_id: addingTaskForStory,
          title: taskData.title!,
          description: taskData.description!,
          status: taskData.status!,
          estimated_hours: taskData.estimated_hours,
          assignee_id: taskData.assignee_id,
        };
        const newTask = await tasksApi.create(payload);
        setStoryTasks((prev) => ({
          ...prev,
          [addingTaskForStory]: [...(prev[addingTaskForStory] || []), newTask],
        }));
      } else if (selectedTask) {
        const updated = await tasksApi.update(selectedTask.id, {
          user_story_id: taskData.user_story_id || selectedTask.user_story_id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          estimated_hours: taskData.estimated_hours,
          assignee_id: taskData.assignee_id,
        });
        setStoryTasks((prev) => ({
          ...prev,
          [selectedTask.user_story_id]: (
            prev[selectedTask.user_story_id] || []
          ).map((t) => (t.id === updated.id ? updated : t)),
        }));
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      let userStoryId = "";
      for (const [sid, tasks] of Object.entries(storyTasks)) {
        if (tasks.some((t) => t.id === taskId)) {
          userStoryId = sid;
          break;
        }
      }
      if (!userStoryId) return;
      await tasksApi.delete(taskId);
      setStoryTasks((prev) => ({
        ...prev,
        [userStoryId]: (prev[userStoryId] || []).filter((t) => t.id !== taskId),
      }));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  // ── User story handlers ───────────────────────────────────────────────
  const handleSaveUserStory = async (
    payload: UserStoryCreatePayload,
    id?: string,
  ) => {
    if (id) {
      const updated = await userStoriesApi.update(id, payload);
      setUserStories((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } else {
      const newStory = await userStoriesApi.create(payload);
      if (newStory.sprint_id === selectedSprintId)
        setUserStories((prev) => [...prev, newStory]);
    }
  };

  const handleStoryMenuOpen = (
    e: React.MouseEvent<HTMLElement>,
    storyId: string,
  ) => {
    e.stopPropagation();
    setStoryMenuAnchor(e.currentTarget);
    setStoryMenuId(storyId);
  };

  const handleStoryMenuClose = () => {
    setStoryMenuAnchor(null);
    setStoryMenuId(null);
  };

  const handleEditStory = () => {
    const story = userStories.find((s) => s.id === storyMenuId);
    if (story) {
      setEditingUserStory(story);
      setUserStoryDialogOpen(true);
    }
    handleStoryMenuClose();
  };

  const handleDeleteStoryRequest = () => {
    setPendingDeleteStoryId(storyMenuId);
    setDeleteStoryConfirmOpen(true);
    handleStoryMenuClose();
  };

  const handleDeleteStory = async () => {
    if (!pendingDeleteStoryId) return;
    const idToDelete = pendingDeleteStoryId;
    setPendingDeleteStoryId(null);
    try {
      await userStoriesApi.delete(idToDelete);
      setUserStories((prev) => prev.filter((s) => s.id !== idToDelete));
      setStoryTasks((prev) => {
        const next = { ...prev };
        delete next[idToDelete];
        return next;
      });
    } catch (error) {
      console.error("Failed to delete user story:", error);
    }
  };

  // ── Sprint handler ────────────────────────────────────────────────────
  const handleSaveSprint = async (payload: SprintCreatePayload) => {
    const created = await sprintsApi.create(payload);
    if (payload.project_id !== selectedProjectId) {
      // Sprint belongs to a different project — switch the project selection.
      // The fetchSprints effect will re-run; pendingSprintIdRef tells it which
      // sprint to auto-select once the new list is loaded.
      pendingSprintIdRef.current = created.id;
      setSelectedProjectId(payload.project_id);
    } else {
      setSprints((prev) => [...prev, created]);
      setSelectedSprintId(created.id);
    }
  };

  // ── Project refresh (after add project) ──────────────────────────────
  const handleProjectCreated = useCallback(async () => {
    const data = await projectsApi.getAll();
    setProjects(data);
    if (data.length > 0) setSelectedProjectId(data[0].id);
  }, [setSelectedProjectId]);

  return {
    // selectors
    selectedProjectId,
    setSelectedProjectId,
    selectedSprintId,
    setSelectedSprintId,
    // data
    projects,
    loadingProjects,
    sprints,
    loadingSprints,
    userStories,
    loadingUserStories,
    storyTasks,
    loadingTasks,
    users,
    // board ui
    expandedStories,
    allCollapsed,
    // dialog / menu state
    dialogOpen,
    selectedTask,
    addingTaskForStory,
    newWorkItemAnchor,
    setNewWorkItemAnchor,
    userStoryDialogOpen,
    setUserStoryDialogOpen,
    editingUserStory,
    setEditingUserStory,
    sprintDialogOpen,
    setSprintDialogOpen,
    editingSprint,
    setEditingSprint,
    addProjectDialogOpen,
    setAddProjectDialogOpen,
    storyMenuAnchor,
    storyMenuId,
    deleteStoryConfirmOpen,
    setDeleteStoryConfirmOpen,
    pendingDeleteStoryId,
    // handlers
    handleCollapseAll,
    toggleStory,
    handleTaskClick,
    getSelectedUserStory,
    handleCloseDialog,
    handleAddTask,
    handleSaveTask,
    handleDeleteTask,
    handleSaveUserStory,
    handleSaveSprint,
    handleStoryMenuOpen,
    handleStoryMenuClose,
    handleEditStory,
    handleDeleteStoryRequest,
    handleDeleteStory,
    handleProjectCreated,
  };
}

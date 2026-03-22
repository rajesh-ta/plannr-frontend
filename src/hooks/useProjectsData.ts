import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const {
    selectedProjectId,
    setSelectedProjectId,
    selectedSprintId,
    setSelectedSprintId,
  } = useProject();

  //  Server state via React Query 

  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: projectsApi.getAll,
  });

  const { data: sprints = [], isLoading: loadingSprints } = useQuery<Sprint[]>({
    queryKey: ["sprints", selectedProjectId],
    queryFn: () => sprintsApi.getByProjectId(selectedProjectId),
    enabled: !!selectedProjectId,
  });

  const { data: userStories = [], isLoading: loadingUserStories } = useQuery<UserStory[]>({
    queryKey: ["userStories", selectedSprintId],
    queryFn: () => userStoriesApi.getBySprintId(selectedSprintId),
    enabled: !!selectedSprintId,
  });

  // Fetch tasks for every user story in parallel
  const storyTaskQueries = useQueries({
    queries: userStories.map((story) => ({
      queryKey: ["tasks", "story", story.id],
      queryFn: () => tasksApi.getByUserStoryId(story.id),
    })),
  });

  const storyTasks: Record<string, Task[]> = {};
  const loadingTasks: Record<string, boolean> = {};
  userStories.forEach((story, i) => {
    storyTasks[story.id] = storyTaskQueries[i]?.data ?? [];
    loadingTasks[story.id] = storyTaskQueries[i]?.isLoading ?? false;
  });

  //  Local UI state 

  const [expandedStories, setExpandedStories] = useState<Record<string, boolean>>({});
  const [allCollapsed, setAllCollapsed] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addingTaskForStory, setAddingTaskForStory] = useState<string | null>(null);
  const [newWorkItemAnchor, setNewWorkItemAnchor] = useState<null | HTMLElement>(null);
  const [userStoryDialogOpen, setUserStoryDialogOpen] = useState(false);
  const [editingUserStory, setEditingUserStory] = useState<UserStory | null>(null);
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);
  const [storyMenuAnchor, setStoryMenuAnchor] = useState<null | HTMLElement>(null);
  const [storyMenuId, setStoryMenuId] = useState<string | null>(null);
  const [deleteStoryConfirmOpen, setDeleteStoryConfirmOpen] = useState(false);
  const [pendingDeleteStoryId, setPendingDeleteStoryId] = useState<string | null>(null);

  const { data: users = [] } = useUsers();

  // Holds a sprint ID to select after sprints refetch (cross-project sprint creation)
  const pendingSprintIdRef = useRef<string | null>(null);

  //  Auto-select first project on initial load 
  useEffect(() => {
    if (!loadingProjects && !selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, loadingProjects, selectedProjectId, setSelectedProjectId]);

  //  Reset sprint selection when project changes 
  useEffect(() => {
    setSelectedSprintId("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  //  Auto-select sprint once loaded and none is selected 
  useEffect(() => {
    if (loadingSprints || !selectedProjectId || selectedSprintId) return;
    if (sprints.length === 0) {
      setSelectedSprintId("");
      return;
    }
    const pendingId = pendingSprintIdRef.current;
    if (pendingId) {
      pendingSprintIdRef.current = null;
      const found = sprints.find((s) => s.id === pendingId);
      setSelectedSprintId(found ? pendingId : sprints[0].id);
    } else {
      setSelectedSprintId(sprints[0].id);
    }
  }, [sprints, loadingSprints, selectedProjectId, selectedSprintId, setSelectedSprintId]);

  //  Reset board expand state when sprint changes 
  useEffect(() => {
    setExpandedStories({});
    setAllCollapsed(false);
  }, [selectedSprintId]);

  //  Board handlers 

  const handleCollapseAll = () => {
    if (allCollapsed) {
      const expanded: Record<string, boolean> = {};
      userStories.forEach((s) => { expanded[s.id] = true; });
      setExpandedStories(expanded);
    } else {
      setExpandedStories({});
    }
    setAllCollapsed(!allCollapsed);
  };

  // Tasks are pre-fetched via useQueries — just toggle expand state
  const toggleStory = (storyId: string) => {
    setExpandedStories((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  //  Task handlers 

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const getSelectedUserStory = () => {
    if (addingTaskForStory) return userStories.find((s) => s.id === addingTaskForStory);
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
        await tasksApi.create({
          user_story_id: addingTaskForStory,
          title: taskData.title!,
          description: taskData.description!,
          status: taskData.status!,
          estimated_hours: taskData.estimated_hours,
          assignee_id: taskData.assignee_id,
          start_date: taskData.start_date ?? null,
          end_date: taskData.end_date ?? null,
        });
        queryClient.invalidateQueries({ queryKey: ["tasks", "story", addingTaskForStory] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      } else if (selectedTask) {
        await tasksApi.update(selectedTask.id, {
          user_story_id: taskData.user_story_id || selectedTask.user_story_id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          estimated_hours: taskData.estimated_hours,
          assignee_id: taskData.assignee_id,
          start_date: taskData.start_date ?? null,
          end_date: taskData.end_date ?? null,
        });
        queryClient.invalidateQueries({ queryKey: ["tasks", "story", selectedTask.user_story_id] });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
      }
    } catch (error) {
      console.error("Failed to save task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      let userStoryId = "";
      for (const story of userStories) {
        const cached = queryClient.getQueryData<Task[]>(["tasks", "story", story.id]);
        if (cached?.some((t) => t.id === taskId)) {
          userStoryId = story.id;
          break;
        }
      }
      if (!userStoryId) return;
      await tasksApi.delete(taskId);
      queryClient.invalidateQueries({ queryKey: ["tasks", "story", userStoryId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  //  User story handlers 

  const handleSaveUserStory = async (payload: UserStoryCreatePayload, id?: string) => {
    if (id) {
      await userStoriesApi.update(id, payload);
    } else {
      await userStoriesApi.create(payload);
    }
    queryClient.invalidateQueries({ queryKey: ["userStories", selectedSprintId] });
  };

  const handleStoryMenuOpen = (e: React.MouseEvent<HTMLElement>, storyId: string) => {
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
      queryClient.invalidateQueries({ queryKey: ["userStories", selectedSprintId] });
      queryClient.removeQueries({ queryKey: ["tasks", "story", idToDelete] });
    } catch (error) {
      console.error("Failed to delete user story:", error);
    }
  };

  //  Sprint handler 

  const handleSaveSprint = async (payload: SprintCreatePayload) => {
    const created = await sprintsApi.create(payload);
    if (payload.project_id !== selectedProjectId) {
      pendingSprintIdRef.current = created.id;
      setSelectedProjectId(payload.project_id);
    } else {
      await queryClient.invalidateQueries({ queryKey: ["sprints", selectedProjectId] });
      setSelectedSprintId(created.id);
    }
  };

  //  Project handler 

  const handleProjectCreated = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["projects"] });
    const fresh = queryClient.getQueryData<Project[]>(["projects"]);
    if (fresh && fresh.length > 0) setSelectedProjectId(fresh[0].id);
  }, [queryClient, setSelectedProjectId]);

  return {
    selectedProjectId,
    setSelectedProjectId,
    selectedSprintId,
    setSelectedSprintId,
    projects,
    loadingProjects,
    sprints,
    loadingSprints,
    userStories,
    loadingUserStories,
    storyTasks,
    loadingTasks,
    users,
    expandedStories,
    allCollapsed,
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

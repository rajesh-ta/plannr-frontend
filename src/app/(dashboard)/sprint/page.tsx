"use client";

import { useState, useEffect } from "react";
import { getUserStoryStatusStyle } from "@/constants/statusColors";
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Collapse,
  Divider,
  Chip,
  Button,
  Menu,
  Tab,
  Tabs,
} from "@mui/material";
import {
  KeyboardArrowDown,
  ExpandMore,
  StarBorder,
  People,
  Add,
  DashboardCustomize,
  ViewWeek,
  MenuBook,
  PlayArrow,
  MoreVert,
  Edit,
  Delete,
  DirectionsRun,
} from "@mui/icons-material";
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
import TaskCard from "@/components/sprint/TaskCard";
import TaskDetailsDialog from "@/components/sprint/TaskDetailsDialog";
import UserStoryDialog from "@/components/sprint/UserStoryDialog";
import SprintDialog from "@/components/sprint/SprintDialog";
import AddProjectDialog from "@/components/sprint/AddProjectDialog";
import { useUsers } from "@/hooks/useUsers";
import PersonIcon from "@mui/icons-material/Person";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PermissionGate from "@/components/common/PermissionGate";
import { usePermissions } from "@/hooks/usePermissions";

export default function SprintPage() {
  const { selectedProjectId, selectedSprintId, setSelectedSprintId } =
    useProject();
  const { can } = usePermissions();
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [loadingUserStories, setLoadingUserStories] = useState(false);
  const [expandedStories, setExpandedStories] = useState<{
    [key: string]: boolean;
  }>({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [storyTasks, setStoryTasks] = useState<{
    [key: string]: Task[];
  }>({});
  const [loadingTasks, setLoadingTasks] = useState<{
    [key: string]: boolean;
  }>({});
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
  const [mobileColIdx, setMobileColIdx] = useState(0);

  // Fetch users using React Query
  const { data: users = [] } = useUsers();

  useEffect(() => {
    projectsApi.getAll().then(setProjects).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProjectId) return;

      try {
        setLoadingSprints(true);
        const data = await sprintsApi.getByProjectId(selectedProjectId);
        setSprints(data);
        if (data.length > 0) {
          setSelectedSprintId(data[0].id);
        } else {
          setSelectedSprintId("");
        }
      } catch (error) {
        console.error("Failed to fetch sprints:", error);
      } finally {
        setLoadingSprints(false);
      }
    };

    fetchSprints();
  }, [selectedProjectId]);

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
        // Reset expanded state and tasks when fetching new user stories
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

  // Auto-load tasks for all user stories
  useEffect(() => {
    if (userStories.length === 0) return;

    const loadTasks = async () => {
      const loadPromises = userStories.map(async (story) => {
        // Check if already loaded
        setStoryTasks((prev) => {
          if (prev[story.id] !== undefined) return prev;
          return prev; // Return unchanged to trigger load
        });

        try {
          setLoadingTasks((prev) => ({ ...prev, [story.id]: true }));
          const tasks = await tasksApi.getByUserStoryId(story.id);
          setStoryTasks((prev) => {
            if (prev[story.id] === undefined) {
              return { ...prev, [story.id]: tasks };
            }
            return prev;
          });
        } catch (error) {
          console.error(`Failed to fetch tasks for story ${story.id}:`, error);
          setStoryTasks((prev) => {
            if (prev[story.id] === undefined) {
              return { ...prev, [story.id]: [] };
            }
            return prev;
          });
        } finally {
          setLoadingTasks((prev) => ({ ...prev, [story.id]: false }));
        }
      });

      await Promise.all(loadPromises);
    };

    loadTasks();
  }, [userStories]);

  const handleCollapseAll = () => {
    if (allCollapsed) {
      // Expand all
      const expanded: { [key: string]: boolean } = {};
      userStories.forEach((story) => {
        expanded[story.id] = true;
      });
      setExpandedStories(expanded);
    } else {
      // Collapse all
      setExpandedStories({});
    }
    setAllCollapsed(!allCollapsed);
  };

  const toggleStory = async (storyId: string) => {
    const isExpanding = !expandedStories[storyId];

    setExpandedStories((prev) => ({
      ...prev,
      [storyId]: isExpanding,
    }));

    // Fetch tasks if expanding and not already loaded
    if (isExpanding && !storyTasks[storyId]) {
      try {
        setLoadingTasks((prev) => ({ ...prev, [storyId]: true }));
        const tasks = await tasksApi.getByUserStoryId(storyId);
        setStoryTasks((prev) => ({ ...prev, [storyId]: tasks }));
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setStoryTasks((prev) => ({ ...prev, [storyId]: [] }));
      } finally {
        setLoadingTasks((prev) => ({ ...prev, [storyId]: false }));
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const getSelectedUserStory = () => {
    // If adding a new task, return the story we're adding to
    if (addingTaskForStory) {
      return userStories.find((story) => story.id === addingTaskForStory);
    }
    // Otherwise, find the story of the selected task
    if (!selectedTask) return null;
    return userStories.find((story) => story.id === selectedTask.user_story_id);
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
        // Creating new task
        const payload: {
          user_story_id: string;
          title: string;
          description: string;
          status: string;
          estimated_hours?: number;
          assignee_id?: string;
        } = {
          user_story_id: addingTaskForStory,
          title: taskData.title!,
          description: taskData.description!,
          status: taskData.status!,
          estimated_hours: taskData.estimated_hours,
          assignee_id: taskData.assignee_id,
        };

        const newTask = await tasksApi.create(payload);

        // Add new task to local state
        const tasks = storyTasks[addingTaskForStory] || [];
        setStoryTasks((prev) => ({
          ...prev,
          [addingTaskForStory]: [...tasks, newTask],
        }));

        console.log("Task created successfully:", newTask);
      } else if (selectedTask) {
        // Updating existing task
        const payload = {
          user_story_id: taskData.user_story_id || selectedTask.user_story_id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          estimated_hours: taskData.estimated_hours,
          assignee_id: taskData.assignee_id,
        };

        const updatedTaskData = await tasksApi.update(selectedTask.id, payload);

        // Update local state with the response from API
        const tasks = storyTasks[selectedTask.user_story_id] || [];
        const updatedTasks = tasks.map((t) =>
          t.id === updatedTaskData.id ? updatedTaskData : t,
        );
        setStoryTasks((prev) => ({
          ...prev,
          [selectedTask.user_story_id]: updatedTasks,
        }));

        console.log("Task updated successfully:", updatedTaskData);
      }
    } catch (error) {
      console.error("Failed to save task:", error);
      // You can add a toast notification here for user feedback
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Find the task to get its user_story_id
      let userStoryId = "";
      for (const [storyId, tasks] of Object.entries(storyTasks)) {
        if (tasks.some((t) => t.id === taskId)) {
          userStoryId = storyId;
          break;
        }
      }

      if (!userStoryId) return;

      // Delete task via API
      await tasksApi.delete(taskId);

      // Remove task from local state
      const tasks = storyTasks[userStoryId] || [];
      const updatedTasks = tasks.filter((t) => t.id !== taskId);
      setStoryTasks((prev) => ({
        ...prev,
        [userStoryId]: updatedTasks,
      }));

      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Failed to delete task:", error);
      // You can add a toast notification here for user feedback
    }
  };

  const handleSaveUserStory = async (
    payload: UserStoryCreatePayload,
    id?: string,
  ) => {
    if (id) {
      const updated = await userStoriesApi.update(id, payload);
      setUserStories((prev) => prev.map((s) => (s.id === id ? updated : s)));
    } else {
      const newStory = await userStoriesApi.create(payload);
      if (newStory.sprint_id === selectedSprintId) {
        setUserStories((prev) => [...prev, newStory]);
      }
    }
  };

  const handleSaveSprint = async (payload: SprintCreatePayload) => {
    const created = await sprintsApi.create(payload);
    setSprints((prev) => [...prev, created]);
    setSelectedSprintId(created.id);
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

  const groupTasksByStatus = (tasks: Task[]) => {
    const groups: { [key: string]: Task[] } = {
      new: [],
      active: [],
      closed: [],
      removed: [],
    };

    tasks.forEach((task) => {
      const status = task.status.toLowerCase();
      if (groups[status]) {
        groups[status].push(task);
      }
    });

    return groups;
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        bgcolor: "#FAF9F8",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #EDEBE9",
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        {/* Sprint Selector and Actions */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: { xs: 1.5, sm: 0 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 250 },
                flexGrow: { xs: 1, sm: 0 },
              }}
            >
              <Select
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                disabled={loadingSprints || sprints.length === 0}
                IconComponent={KeyboardArrowDown}
                sx={{
                  fontSize: "20px",
                  fontWeight: 600,
                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none",
                  },
                  "& .MuiSelect-select": {
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                  },
                }}
              >
                {loadingSprints ? (
                  <MenuItem disabled>Loading sprints...</MenuItem>
                ) : sprints.length === 0 ? (
                  <MenuItem disabled>No sprints available</MenuItem>
                ) : (
                  sprints.map((sprint) => (
                    <MenuItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            <IconButton size="small">
              <StarBorder sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small">
              <People sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {(can("story:write") ||
              can("sprint:write") ||
              can("project:write")) && (
              <>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={(e) => setNewWorkItemAnchor(e.currentTarget)}
                  sx={{
                    bgcolor: "#0078D4",
                    textTransform: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                    "&:hover": {
                      bgcolor: "#106EBE",
                    },
                  }}
                >
                  New Work Item
                </Button>
                <Menu
                  anchorEl={newWorkItemAnchor}
                  open={Boolean(newWorkItemAnchor)}
                  onClose={() => setNewWorkItemAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                  transformOrigin={{ vertical: "top", horizontal: "left" }}
                  PaperProps={{
                    sx: {
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      minWidth: 200,
                    },
                  }}
                >
                  {can("story:write") && (
                    <MenuItem
                      onClick={() => {
                        setNewWorkItemAnchor(null);
                        setUserStoryDialogOpen(true);
                      }}
                      sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                    >
                      <MenuBook sx={{ fontSize: 18, color: "#0078D4" }} />
                      Add User Story
                    </MenuItem>
                  )}
                  {can("sprint:write") && (
                    <MenuItem
                      onClick={() => {
                        setNewWorkItemAnchor(null);
                        setEditingSprint(null);
                        setSprintDialogOpen(true);
                      }}
                      sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                    >
                      <DirectionsRun sx={{ fontSize: 18, color: "#0078D4" }} />
                      Add Sprint
                    </MenuItem>
                  )}
                  {can("project:write") && (
                    <MenuItem
                      onClick={() => {
                        setNewWorkItemAnchor(null);
                        setAddProjectDialogOpen(true);
                      }}
                      sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                    >
                      <DashboardCustomize
                        sx={{ fontSize: 18, color: "#0078D4" }}
                      />
                      Add Project
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<ViewWeek />}
              sx={{
                textTransform: "none",
                fontSize: "14px",
                borderColor: "#8A8886",
                color: "#323130",
                "&:hover": {
                  borderColor: "#323130",
                  bgcolor: "#F3F2F1",
                },
              }}
            >
              Column Options
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filters Section */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #EDEBE9",
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <FormControl size="small">
          <Select defaultValue="all" sx={{ fontSize: "13px", minWidth: 100 }}>
            <MenuItem value="all">Person: All</MenuItem>
            <MenuItem value="me">Assigned to me</MenuItem>
          </Select>
        </FormControl>
        <Typography
          sx={{
            fontSize: "13px",
            color: "#0078D4",
            ml: "auto",
          }}
        >
          October 7 - October 20
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#605E5C" }}>
          10 work days
        </Typography>
      </Box>

      {/* Main Content - User Stories */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {/* Collapse All Button */}
        <Box sx={{ mb: 2 }}>
          <Typography
            onClick={handleCollapseAll}
            sx={{
              fontSize: "12px",
              color: "#0078D4",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            <ExpandMore sx={{ fontSize: 16 }} />
            {allCollapsed ? "Expand all" : "Collapse all"}
          </Typography>
        </Box>

        {/* Mobile column filter tabs */}
        <Box sx={{ display: { xs: "block", md: "none" }, mb: 1 }}>
          <Tabs
            value={mobileColIdx}
            onChange={(_e, v) => setMobileColIdx(v)}
            variant="fullWidth"
            sx={{ borderBottom: "1px solid #EDEBE9", minHeight: 36 }}
            TabIndicatorProps={{ style: { backgroundColor: "#0078D4" } }}
          >
            {["New", "Active", "Closed", "Removed"].map((col) => (
              <Tab
                key={col}
                label={col}
                sx={{
                  fontSize: "12px",
                  textTransform: "none",
                  minHeight: 36,
                  py: 0.5,
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Column Headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(130px, 45%) 1fr",
              md: "300px 1fr 1fr 1fr 1fr",
            },
            gap: 2,
            px: 2,
            py: 1,
            bgcolor: "#F3F2F1",
            borderRadius: "4px 4px 0 0",
            fontSize: "12px",
            fontWeight: 600,
            color: "#323130",
          }}
        >
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            User Story
          </Typography>
          {["New", "Active", "Closed", "Removed"].map((col, i) => (
            <Typography
              key={col}
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                display: {
                  xs: i === mobileColIdx ? "block" : "none",
                  md: "block",
                },
              }}
            >
              {col}
            </Typography>
          ))}
        </Box>

        {/* User Stories List */}
        <Box sx={{ bgcolor: "white", border: "1px solid #EDEBE9" }}>
          {loadingUserStories ? (
            <Box sx={{ p: 3, textAlign: "center", color: "#605E5C" }}>
              <Typography>Loading user stories...</Typography>
            </Box>
          ) : userStories.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center", color: "#605E5C" }}>
              <Typography>No user stories found for this sprint</Typography>
            </Box>
          ) : (
            userStories.map((story, index) => {
              const tasks = storyTasks[story.id] || [];
              const groupedTasks = groupTasksByStatus(tasks);

              return (
                <Box key={story.id}>
                  {index > 0 && <Divider />}
                  {/* User Story Row with Tasks */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "minmax(130px, 45%) 1fr",
                        md: "300px 1fr 1fr 1fr 1fr",
                      },
                      gap: 2,
                      px: 2,
                      py: 2,
                      alignItems: "start",
                      "&:hover": {
                        bgcolor: "#FAFAFA",
                      },
                    }}
                  >
                    {/* User Story Column */}
                    <Box>
                      {/* Title Row — always visible */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          userSelect: "none",
                          "&:hover .story-title": { color: "#0078D4" },
                          "&:hover .story-menu-btn": { opacity: 1 },
                        }}
                      >
                        {/* Clickable left part */}
                        <Box
                          onClick={() => toggleStory(story.id)}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            flex: 1,
                            cursor: "pointer",
                            minWidth: 0,
                          }}
                        >
                          {/* Rotating triangle */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              flexShrink: 0,
                              transition: "transform 0.2s ease",
                              transform: expandedStories[story.id]
                                ? "rotate(90deg)"
                                : "rotate(0deg)",
                              color: "#605E5C",
                            }}
                          >
                            <PlayArrow sx={{ fontSize: 13 }} />
                          </Box>

                          {/* User story icon */}
                          <MenuBook
                            sx={{
                              fontSize: 16,
                              color: "#0078D4",
                              flexShrink: 0,
                            }}
                          />

                          {/* Title */}
                          <Typography
                            className="story-title"
                            sx={{
                              fontSize: "13px",
                              color: "#323130",
                              lineHeight: 1.4,
                              flex: 1,
                              transition: "color 0.15s ease",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {story.title}
                          </Typography>
                        </Box>

                        {/* Three-dot menu button */}
                        <PermissionGate action="story:write">
                          <IconButton
                            className="story-menu-btn"
                            size="small"
                            onClick={(e) => handleStoryMenuOpen(e, story.id)}
                            sx={{
                              opacity: 0,
                              transition: "opacity 0.15s ease",
                              p: 0.25,
                              flexShrink: 0,
                            }}
                          >
                            <MoreVert sx={{ fontSize: 16 }} />
                          </IconButton>
                        </PermissionGate>

                        {/* Story Actions Menu */}
                        <Menu
                          anchorEl={storyMenuAnchor}
                          open={
                            Boolean(storyMenuAnchor) && storyMenuId === story.id
                          }
                          onClose={handleStoryMenuClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                          }}
                          transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                          }}
                          slotProps={{
                            paper: {
                              sx: {
                                minWidth: 120,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                borderRadius: "4px",
                              },
                            },
                          }}
                        >
                          <PermissionGate action="story:write">
                            <MenuItem
                              onClick={handleEditStory}
                              sx={{ fontSize: "13px", gap: 1 }}
                            >
                              <Edit sx={{ fontSize: 15, color: "#605E5C" }} />
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={handleDeleteStoryRequest}
                              sx={{
                                fontSize: "13px",
                                gap: 1,
                                color: "#D13438",
                              }}
                            >
                              <Delete sx={{ fontSize: 15 }} />
                              Delete
                            </MenuItem>
                          </PermissionGate>
                        </Menu>
                      </Box>

                      {/* Expandable Details */}
                      <Collapse in={expandedStories[story.id]} timeout={250}>
                        <Box sx={{ pl: 3.5, pt: 1 }}>
                          {/* Story No */}
                          {story.user_story_no && (
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color: "#7B2FBE",
                                fontWeight: 600,
                                textDecoration: "underline",
                                mb: 0.5,
                              }}
                            >
                              {story.user_story_no}
                            </Typography>
                          )}

                          {/* Description */}
                          {story.description && (
                            <Typography
                              sx={{
                                fontSize: "11px",
                                color: "#605E5C",
                                mb: 1,
                                lineHeight: 1.4,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {story.description}
                            </Typography>
                          )}

                          {/* Status + Add Task */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                              flexWrap: "wrap",
                              mb: 0.75,
                            }}
                          >
                            <Chip
                              label={
                                getUserStoryStatusStyle(story.status).label ||
                                story.status
                              }
                              size="small"
                              sx={{
                                fontSize: "10px",
                                height: 18,
                                bgcolor: getUserStoryStatusStyle(story.status)
                                  .bg,
                                color: getUserStoryStatusStyle(story.status)
                                  .color,
                                fontWeight: 500,
                              }}
                            />
                            <PermissionGate action="task:write">
                              <Button
                                startIcon={
                                  <Add sx={{ fontSize: "12px !important" }} />
                                }
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddTask(story.id);
                                }}
                                sx={{
                                  textTransform: "none",
                                  fontSize: "11px",
                                  minHeight: 18,
                                  height: 20,
                                  py: 0,
                                  color: "#7B2FBE",
                                }}
                              >
                                Add Task
                              </Button>
                            </PermissionGate>
                          </Box>

                          {/* Assignee */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {(() => {
                              const assignee = users.find(
                                (u) => u.id === story.assignee_id,
                              );
                              return assignee ? (
                                <>
                                  <PersonIcon
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      color: "#107C10",
                                    }}
                                  />
                                  <Typography
                                    sx={{ fontSize: "11px", color: "#323130" }}
                                  >
                                    {assignee.name}
                                  </Typography>
                                </>
                              ) : (
                                <>
                                  <PersonOutlineIcon
                                    sx={{
                                      width: 14,
                                      height: 14,
                                      color: "#605E5C",
                                    }}
                                  />
                                  <Typography
                                    sx={{ fontSize: "11px", color: "#605E5C" }}
                                  >
                                    Unassigned
                                  </Typography>
                                </>
                              );
                            })()}
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>

                    {/* New Column */}
                    <Box
                      sx={{
                        display: {
                          xs: mobileColIdx === 0 ? "flex" : "none",
                          md: "flex",
                        },
                        flexDirection: "column",
                      }}
                    >
                      <Collapse in={expandedStories[story.id]} timeout="auto">
                        {loadingTasks[story.id] ? (
                          <Typography
                            sx={{ fontSize: "11px", color: "#605E5C" }}
                          >
                            Loading...
                          </Typography>
                        ) : (
                          groupedTasks.new.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              borderColor="#797775"
                              onClick={() => handleTaskClick(task)}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </Collapse>
                    </Box>

                    {/* Active Column */}
                    <Box
                      sx={{
                        display: {
                          xs: mobileColIdx === 1 ? "flex" : "none",
                          md: "flex",
                        },
                        flexDirection: "column",
                      }}
                    >
                      <Collapse in={expandedStories[story.id]} timeout="auto">
                        {loadingTasks[story.id] ? (
                          <Typography
                            sx={{ fontSize: "11px", color: "#605E5C" }}
                          >
                            Loading...
                          </Typography>
                        ) : (
                          groupedTasks.active.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              borderColor="#0078D4"
                              onClick={() => handleTaskClick(task)}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </Collapse>
                    </Box>

                    {/* Closed Column */}
                    <Box
                      sx={{
                        display: {
                          xs: mobileColIdx === 2 ? "flex" : "none",
                          md: "flex",
                        },
                        flexDirection: "column",
                      }}
                    >
                      <Collapse in={expandedStories[story.id]} timeout="auto">
                        {loadingTasks[story.id] ? (
                          <Typography
                            sx={{ fontSize: "11px", color: "#605E5C" }}
                          >
                            Loading...
                          </Typography>
                        ) : (
                          groupedTasks.closed.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              borderColor="#107C10"
                              onClick={() => handleTaskClick(task)}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </Collapse>
                    </Box>

                    {/* Removed Column */}
                    <Box
                      sx={{
                        display: {
                          xs: mobileColIdx === 3 ? "flex" : "none",
                          md: "flex",
                        },
                        flexDirection: "column",
                      }}
                    >
                      <Collapse in={expandedStories[story.id]} timeout="auto">
                        {loadingTasks[story.id] ? (
                          <Typography
                            sx={{ fontSize: "11px", color: "#605E5C" }}
                          >
                            Loading...
                          </Typography>
                        ) : (
                          groupedTasks.removed.map((task) => (
                            <TaskCard
                              key={task.id}
                              task={task}
                              borderColor="#A4262C"
                              onClick={() => handleTaskClick(task)}
                              onDelete={handleDeleteTask}
                            />
                          ))
                        )}
                      </Collapse>
                    </Box>
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>
      <TaskDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        task={selectedTask}
        userStory={getSelectedUserStory() ?? undefined}
        onSave={handleSaveTask}
        readOnly={!can("task:write")}
      />
      <UserStoryDialog
        open={userStoryDialogOpen}
        onClose={() => {
          setUserStoryDialogOpen(false);
          setEditingUserStory(null);
        }}
        sprints={sprints}
        defaultSprintId={selectedSprintId}
        editStory={editingUserStory}
        onSave={handleSaveUserStory}
      />
      <SprintDialog
        open={sprintDialogOpen}
        onClose={() => {
          setSprintDialogOpen(false);
          setEditingSprint(null);
        }}
        projectId={selectedProjectId || ""}
        projects={projects}
        editSprint={editingSprint}
        onSave={handleSaveSprint}
      />
      <DeleteConfirmDialog
        open={deleteStoryConfirmOpen}
        onClose={() => setDeleteStoryConfirmOpen(false)}
        onConfirm={handleDeleteStory}
        itemType="User Story"
        itemName={userStories.find((s) => s.id === pendingDeleteStoryId)?.title}
      />
      <AddProjectDialog
        open={addProjectDialogOpen}
        onClose={() => setAddProjectDialogOpen(false)}
      />
    </Box>
  );
}

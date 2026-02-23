"use client";

import { useState, useEffect } from "react";
import { getUserStoryStatusStyle } from "@/constants/statusColors";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Collapse,
  Divider,
  Chip,
  Button,
  Menu,
} from "@mui/material";
import {
  KeyboardArrowDown,
  ExpandMore,
  Add,
  DashboardCustomize,
  MenuBook,
  PlayArrow,
  MoreVert,
  Edit,
  Delete,
  DirectionsRun,
} from "@mui/icons-material";
import { useProject } from "@/contexts/ProjectContext";
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

export default function ProjectsPage() {
  const {
    selectedProjectId,
    setSelectedProjectId,
    selectedSprintId,
    setSelectedSprintId,
  } = useProject();

  // Projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Sprints
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);

  // Board state
  const [userStories, setUserStories] = useState<UserStory[]>([]);
  const [loadingUserStories, setLoadingUserStories] = useState(false);
  const [expandedStories, setExpandedStories] = useState<{
    [key: string]: boolean;
  }>({});
  const [allCollapsed, setAllCollapsed] = useState(false);
  const [storyTasks, setStoryTasks] = useState<{ [key: string]: Task[] }>({});
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

  const { data: users = [] } = useUsers();

  // Fetch projects on mount
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

  // Fetch sprints whenever selected project changes
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
        setSprints([]);
        setSelectedSprintId("");
      } finally {
        setLoadingSprints(false);
      }
    };
    fetchSprints();
  }, [selectedProjectId, setSelectedSprintId]);

  // Fetch user stories whenever sprint changes
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

  // Auto-load tasks for all user stories
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

  const handleCollapseAll = () => {
    if (allCollapsed) {
      const expanded: { [key: string]: boolean } = {};
      userStories.forEach((story) => {
        expanded[story.id] = true;
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
        const updatedTaskData = await tasksApi.update(selectedTask.id, {
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
          ).map((t) => (t.id === updatedTaskData.id ? updatedTaskData : t)),
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
      if (groups[status]) groups[status].push(task);
    });
    return groups;
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: "#FAF9F8", minHeight: "100vh" }}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #EDEBE9",
          px: 3,
          py: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Left: Project + Sprint dropdowns */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Project dropdown */}
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontSize: "13px" }} id="project-select-label">
                Project
              </InputLabel>
              <Select
                labelId="project-select-label"
                label="Project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={loadingProjects || projects.length === 0}
                IconComponent={KeyboardArrowDown}
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  "& fieldset": { borderColor: "#EDEBE9" },
                  "&:hover fieldset": { borderColor: "#C8C6C4" },
                  "&.Mui-focused fieldset": { borderColor: "#0078D4" },
                }}
              >
                {loadingProjects ? (
                  <MenuItem disabled>
                    <em>Loading projects…</em>
                  </MenuItem>
                ) : projects.length === 0 ? (
                  <MenuItem disabled>
                    <em>No projects</em>
                  </MenuItem>
                ) : (
                  projects.map((p) => (
                    <MenuItem key={p.id} value={p.id} sx={{ fontSize: "13px" }}>
                      {p.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Sprint dropdown */}
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel sx={{ fontSize: "13px" }} id="sprint-select-label">
                Sprint
              </InputLabel>
              <Select
                labelId="sprint-select-label"
                label="Sprint"
                value={selectedSprintId}
                onChange={(e) => setSelectedSprintId(e.target.value)}
                disabled={
                  loadingSprints || !selectedProjectId || sprints.length === 0
                }
                IconComponent={KeyboardArrowDown}
                sx={{
                  fontSize: "14px",
                  fontWeight: 600,
                  "& fieldset": { borderColor: "#EDEBE9" },
                  "&:hover fieldset": { borderColor: "#C8C6C4" },
                  "&.Mui-focused fieldset": { borderColor: "#0078D4" },
                }}
              >
                {loadingSprints ? (
                  <MenuItem disabled>
                    <em>Loading sprints…</em>
                  </MenuItem>
                ) : sprints.length === 0 ? (
                  <MenuItem disabled>
                    <em>No sprints</em>
                  </MenuItem>
                ) : (
                  sprints.map((sprint) => (
                    <MenuItem
                      key={sprint.id}
                      value={sprint.id}
                      sx={{ fontSize: "13px" }}
                    >
                      {sprint.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          {/* Right: Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PermissionGate action="story:write">
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={(e) => setNewWorkItemAnchor(e.currentTarget)}
                sx={{
                  bgcolor: "#0078D4",
                  textTransform: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#106EBE" },
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
                <MenuItem
                  onClick={() => {
                    setNewWorkItemAnchor(null);
                    setAddProjectDialogOpen(true);
                  }}
                  sx={{ fontSize: "13px", py: 1, gap: 1.5 }}
                >
                  <DashboardCustomize sx={{ fontSize: 18, color: "#0078D4" }} />
                  Add Project
                </MenuItem>
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
              </Menu>
            </PermissionGate>
          </Box>
        </Box>
      </Box>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      {/* <Box
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid #EDEBE9",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <FormControl size="small">
          <Select defaultValue="all" sx={{ fontSize: "13px", minWidth: 100 }}>
            <MenuItem value="all">Person: All</MenuItem>
            <MenuItem value="me">Assigned to me</MenuItem>
          </Select>
        </FormControl>
        <Typography sx={{ fontSize: "13px", color: "#0078D4", ml: "auto" }}>
          October 7 - October 20
        </Typography>
        <Typography sx={{ fontSize: "13px", color: "#605E5C" }}>
          10 work days
        </Typography>
      </Box> */}

      {/* ── Board ────────────────────────────────────────────────────────── */}
      <Box sx={{ px: 3, py: 2 }}>
        {/* Collapse all */}
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
              "&:hover": { textDecoration: "underline" },
            }}
          >
            <ExpandMore sx={{ fontSize: 16 }} />
            {allCollapsed ? "Expand all" : "Collapse all"}
          </Typography>
        </Box>

        {/* Column Headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "300px 1fr 1fr 1fr 1fr",
            gap: 2,
            px: 2,
            py: 1,
            bgcolor: "#F3F2F1",
            borderRadius: "4px 4px 0 0",
          }}
        >
          {["User Story", "New", "Active", "Closed", "Removed"].map((col) => (
            <Typography key={col} sx={{ fontSize: "12px", fontWeight: 600 }}>
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
              <Typography>
                {selectedSprintId
                  ? "No user stories found for this sprint"
                  : "Select a project and sprint to view the board"}
              </Typography>
            </Box>
          ) : (
            userStories.map((story, index) => {
              const tasks = storyTasks[story.id] || [];
              const groupedTasks = groupTasksByStatus(tasks);
              return (
                <Box key={story.id}>
                  {index > 0 && <Divider />}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "300px 1fr 1fr 1fr 1fr",
                      gap: 2,
                      px: 2,
                      py: 2,
                      alignItems: "start",
                      "&:hover": { bgcolor: "#FAFAFA" },
                    }}
                  >
                    {/* User Story Column */}
                    <Box>
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
                          <MenuBook
                            sx={{
                              fontSize: 16,
                              color: "#0078D4",
                              flexShrink: 0,
                            }}
                          />
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
                              <Edit sx={{ fontSize: 15, color: "#605E5C" }} />{" "}
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
                              <Delete sx={{ fontSize: 15 }} /> Delete
                            </MenuItem>
                          </PermissionGate>
                        </Menu>
                      </Box>

                      <Collapse in={expandedStories[story.id]} timeout={250}>
                        <Box sx={{ pl: 3.5, pt: 1 }}>
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

                    {/* Task columns */}
                    {(["new", "active", "closed", "removed"] as const).map(
                      (status, i) => (
                        <Box
                          key={status}
                          sx={{ display: "flex", flexDirection: "column" }}
                        >
                          <Collapse
                            in={expandedStories[story.id]}
                            timeout="auto"
                          >
                            {loadingTasks[story.id] ? (
                              <Typography
                                sx={{ fontSize: "11px", color: "#605E5C" }}
                              >
                                Loading...
                              </Typography>
                            ) : (
                              groupedTasks[status].map((task) => (
                                <TaskCard
                                  key={task.id}
                                  task={task}
                                  borderColor={
                                    [
                                      "#797775",
                                      "#0078D4",
                                      "#107C10",
                                      "#A4262C",
                                    ][i]
                                  }
                                  onClick={() => handleTaskClick(task)}
                                  onDelete={handleDeleteTask}
                                />
                              ))
                            )}
                          </Collapse>
                        </Box>
                      ),
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <TaskDetailsDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        task={selectedTask}
        userStory={getSelectedUserStory() ?? undefined}
        onSave={handleSaveTask}
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
        onCreated={async () => {
          const data = await projectsApi.getAll();
          setProjects(data);
          if (data.length > 0) setSelectedProjectId(data[0].id);
        }}
      />
    </Box>
  );
}

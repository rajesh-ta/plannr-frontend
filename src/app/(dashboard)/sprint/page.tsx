"use client";

import { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  KeyboardArrowDown,
  ExpandMore,
  StarBorder,
  People,
  Add,
  ViewWeek,
  MenuBook,
  PlayArrow,
} from "@mui/icons-material";
import { useProject } from "@/contexts/ProjectContext";
import { sprintsApi, Sprint } from "@/services/api/sprints";
import {
  userStoriesApi,
  UserStory,
  UserStoryCreatePayload,
} from "@/services/api/userStories";
import { tasksApi, Task } from "@/services/api/tasks";
import TaskCard from "@/components/sprint/TaskCard";
import TaskDetailsDialog from "@/components/sprint/TaskDetailsDialog";
import UserStoryDialog from "@/components/sprint/UserStoryDialog";
import { useUsers } from "@/hooks/useUsers";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

export default function SprintPage() {
  const { selectedProjectId } = useProject();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState("");
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

  // Fetch users using React Query
  const { data: users = [] } = useUsers();

  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProjectId) return;

      try {
        setLoadingSprints(true);
        const data = await sprintsApi.getByProjectId(selectedProjectId);
        setSprints(data);
        if (data.length > 0) {
          setSelectedSprint(data[0].id);
        } else {
          setSelectedSprint("");
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
      if (!selectedSprint) {
        setUserStories([]);
        return;
      }

      try {
        setLoadingUserStories(true);
        const data = await userStoriesApi.getBySprintId(selectedSprint);
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
  }, [selectedSprint]);

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

  const handleSaveUserStory = async (payload: UserStoryCreatePayload) => {
    const newStory = await userStoriesApi.create(payload);
    // If the new story belongs to the selected sprint, add it to the list
    if (newStory.sprint_id === selectedSprint) {
      setUserStories((prev) => [...prev, newStory]);
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
          px: 3,
          py: 2,
        }}
      >
        {/* Sprint Selector and Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 250 }}>
              <Select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
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
                sx: { boxShadow: "0 2px 8px rgba(0,0,0,0.15)", minWidth: 200 },
              }}
            >
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
              <MenuItem disabled sx={{ fontSize: "13px", py: 1, gap: 1.5 }}>
                <Add sx={{ fontSize: 18, color: "#605E5C" }} />
                Add Sprint
              </MenuItem>
            </Menu>
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
      <Box sx={{ px: 3, py: 2 }}>
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
            fontSize: "12px",
            fontWeight: 600,
            color: "#323130",
          }}
        >
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            User Story
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            New
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            Active
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            Closed
          </Typography>
          <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
            Removed
          </Typography>
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
                      gridTemplateColumns: "300px 1fr 1fr 1fr 1fr",
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
                        onClick={() => toggleStory(story.id)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          cursor: "pointer",
                          userSelect: "none",
                          "&:hover .story-title": { color: "#0078D4" },
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

                        {/* User story icon: two stacked blue bars */}
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            flexShrink: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 14,
                              height: 5,
                              bgcolor: "#0078D4",
                              borderRadius: "1px",
                            }}
                          />
                          <Box
                            sx={{
                              width: 14,
                              height: 5,
                              bgcolor: "#0078D4",
                              borderRadius: "1px",
                            }}
                          />
                        </Box>

                        {/* Title */}
                        <Typography
                          className="story-title"
                          sx={{
                            fontSize: "13px",
                            color: "#323130",
                            lineHeight: 1.4,
                            flex: 1,
                            transition: "color 0.15s ease",
                          }}
                        >
                          {story.title}
                        </Typography>
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
                              label={story.status}
                              size="small"
                              sx={{
                                fontSize: "10px",
                                height: 18,
                                bgcolor: "#F3F2F1",
                              }}
                            />
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
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
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
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
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
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
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
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
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
      />
      <UserStoryDialog
        open={userStoryDialogOpen}
        onClose={() => setUserStoryDialogOpen(false)}
        sprints={sprints}
        defaultSprintId={selectedSprint}
        onSave={handleSaveUserStory}
      />
    </Box>
  );
}

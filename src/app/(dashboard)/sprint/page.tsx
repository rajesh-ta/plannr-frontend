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
} from "@mui/material";
import {
  KeyboardArrowDown,
  ExpandMore,
  ExpandLess,
  StarBorder,
  People,
  Add,
  ViewWeek,
} from "@mui/icons-material";
import { useProject } from "@/contexts/ProjectContext";
import { sprintsApi, Sprint } from "@/services/api/sprints";
import { userStoriesApi, UserStory } from "@/services/api/userStories";
import { tasksApi, Task } from "@/services/api/tasks";
import TaskCard from "@/components/sprint/TaskCard";
import TaskDetailsDialog from "@/components/sprint/TaskDetailsDialog";
import { useUsers } from "@/hooks/useUsers";

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

  // Fetch users using React Query
  useUsers();

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
    if (!selectedTask) return null;
    return userStories.find((story) => story.id === selectedTask.user_story_id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTask(null);
  };

  const handleSaveTask = async (updatedTask: Partial<Task>) => {
    if (!selectedTask) return;

    try {
      const payload = {
        user_story_id: updatedTask.user_story_id || selectedTask.user_story_id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
        estimated_hours: updatedTask.estimated_hours,
        assignee_id: updatedTask.assignee_id,
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
    } catch (error) {
      console.error("Failed to update task:", error);
      // You can add a toast notification here for user feedback
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        sx={{ mt: -0.5 }}
                        onClick={() => toggleStory(story.id)}
                      >
                        {expandedStories[story.id] ? (
                          <ExpandLess sx={{ fontSize: 18 }} />
                        ) : (
                          <ExpandMore sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              bgcolor: "#0078D4",
                              borderRadius: "2px",
                            }}
                          />
                          <Typography
                            sx={{ fontSize: "13px", fontWeight: 500 }}
                          >
                            {story.title}
                          </Typography>
                        </Box>
                        <Collapse in={expandedStories[story.id]} timeout="auto">
                          <Box sx={{ mt: 1, pl: 3 }}>
                            {story.description && (
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  mb: 1,
                                  color: "#605E5C",
                                }}
                              >
                                {story.description}
                              </Typography>
                            )}
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                flexWrap: "wrap",
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
                              {story.priority && (
                                <Chip
                                  label={story.priority}
                                  size="small"
                                  sx={{
                                    fontSize: "10px",
                                    height: 18,
                                    bgcolor: "#FFF4CE",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Collapse>
                      </Box>
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
        userStoryId={getSelectedUserStory()?.id}
        onSave={handleSaveTask}
      />
    </Box>
  );
}

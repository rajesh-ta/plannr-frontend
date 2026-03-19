import {
  Box,
  Typography,
  Collapse,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  MenuBook,
  PlayArrow,
  MoreVert,
  Edit,
  Delete,
  Add,
} from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { getUserStoryStatusStyle } from "@/constants/statusColors";
import { UserStory } from "@/services/api/userStories";
import { Task } from "@/services/api/tasks";
import { User } from "@/services/api/users";
import TaskCard from "@/components/sprint/TaskCard";
import PermissionGate from "@/components/common/PermissionGate";

const TASK_STATUSES = ["new", "active", "closed", "removed"] as const;
const BORDER_COLORS = ["#797775", "#0078D4", "#107C10", "#A4262C"];

function groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
  const groups: Record<string, Task[]> = {
    new: [],
    active: [],
    closed: [],
    removed: [],
  };
  tasks.forEach((task) => {
    const s = task.status.toLowerCase();
    if (groups[s]) groups[s].push(task);
  });
  return groups;
}

interface UserStoryRowProps {
  story: UserStory;
  tasks: Task[];
  loadingTasks: boolean;
  isExpanded: boolean;
  users: User[];
  storyMenuAnchor: null | HTMLElement;
  storyMenuId: string | null;
  mobileColumnIndex?: number;
  onToggle: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (storyId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStoryMenuOpen: (e: React.MouseEvent<HTMLElement>, storyId: string) => void;
  onStoryMenuClose: () => void;
  onEditStory: () => void;
  onDeleteStoryRequest: () => void;
}

export default function UserStoryRow({
  story,
  tasks,
  loadingTasks,
  isExpanded,
  users,
  storyMenuAnchor,
  storyMenuId,
  mobileColumnIndex = 0,
  onToggle,
  onTaskClick,
  onAddTask,
  onDeleteTask,
  onStoryMenuOpen,
  onStoryMenuClose,
  onEditStory,
  onDeleteStoryRequest,
}: UserStoryRowProps) {
  const grouped = groupTasksByStatus(tasks);
  const assignee = users.find((u) => u.id === story.assignee_id);
  const statusStyle = getUserStoryStatusStyle(story.status);

  return (
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
        "&:hover": { bgcolor: "#FAFAFA" },
      }}
    >
      {/* User Story column */}
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
            onClick={() => onToggle(story.id)}
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
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                color: "#605E5C",
              }}
            >
              <PlayArrow sx={{ fontSize: 13 }} />
            </Box>
            <MenuBook sx={{ fontSize: 16, color: "#0078D4", flexShrink: 0 }} />
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
                whiteSpace: { xs: "normal", md: "nowrap" },
              }}
            >
              {story.title}
            </Typography>
          </Box>

          <PermissionGate action="story:write">
            <IconButton
              className="story-menu-btn"
              size="small"
              onClick={(e) => onStoryMenuOpen(e, story.id)}
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
            open={Boolean(storyMenuAnchor) && storyMenuId === story.id}
            onClose={onStoryMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
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
              <MenuItem onClick={onEditStory} sx={{ fontSize: "13px", gap: 1 }}>
                <Edit sx={{ fontSize: 15, color: "#605E5C" }} /> Edit
              </MenuItem>
              <MenuItem
                onClick={onDeleteStoryRequest}
                sx={{ fontSize: "13px", gap: 1, color: "#D13438" }}
              >
                <Delete sx={{ fontSize: 15 }} /> Delete
              </MenuItem>
            </PermissionGate>
          </Menu>
        </Box>

        <Collapse in={isExpanded} timeout={250}>
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
                  WebkitLineClamp: { xs: 3, md: 2 },
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
                label={statusStyle.label || story.status}
                size="small"
                sx={{
                  fontSize: "10px",
                  height: 18,
                  bgcolor: statusStyle.bg,
                  color: statusStyle.color,
                  fontWeight: 500,
                }}
              />
              <PermissionGate action="task:write">
                <Button
                  startIcon={<Add sx={{ fontSize: "12px !important" }} />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddTask(story.id);
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {assignee ? (
                <>
                  <PersonIcon
                    sx={{ width: 14, height: 14, color: "#107C10" }}
                  />
                  <Typography sx={{ fontSize: "11px", color: "#323130" }}>
                    {assignee.name}
                  </Typography>
                </>
              ) : (
                <>
                  <PersonOutlineIcon
                    sx={{ width: 14, height: 14, color: "#605E5C" }}
                  />
                  <Typography sx={{ fontSize: "11px", color: "#605E5C" }}>
                    Unassigned
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Collapse>
      </Box>

      {/* Task columns */}
      {TASK_STATUSES.map((status, i) => (
        <Box
          key={status}
          sx={{
            display: {
              xs: i === mobileColumnIndex ? "flex" : "none",
              md: "flex",
            },
            flexDirection: "column",
          }}
        >
          <Collapse in={isExpanded} timeout="auto">
            {loadingTasks ? (
              <Typography sx={{ fontSize: "11px", color: "#605E5C" }}>
                Loading...
              </Typography>
            ) : (
              grouped[status].map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  borderColor={BORDER_COLORS[i]}
                  onClick={() => onTaskClick(task)}
                  onDelete={onDeleteTask}
                />
              ))
            )}
          </Collapse>
        </Box>
      ))}
    </Box>
  );
}

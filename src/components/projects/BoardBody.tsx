import { Box, Typography, Divider } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { UserStory } from "@/services/api/userStories";
import { Task } from "@/services/api/tasks";
import { User } from "@/services/api/users";
import UserStoryRow from "./UserStoryRow";

const COLUMNS = ["User Story", "New", "Active", "Closed", "Removed"];

interface BoardBodyProps {
  userStories: UserStory[];
  loadingUserStories: boolean;
  selectedSprintId: string;
  storyTasks: Record<string, Task[]>;
  loadingTasks: Record<string, boolean>;
  expandedStories: Record<string, boolean>;
  allCollapsed: boolean;
  users: User[];
  storyMenuAnchor: null | HTMLElement;
  storyMenuId: string | null;
  onCollapseAll: () => void;
  onToggleStory: (id: string) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (storyId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onStoryMenuOpen: (e: React.MouseEvent<HTMLElement>, storyId: string) => void;
  onStoryMenuClose: () => void;
  onEditStory: () => void;
  onDeleteStoryRequest: () => void;
}

export default function BoardBody({
  userStories,
  loadingUserStories,
  selectedSprintId,
  storyTasks,
  loadingTasks,
  expandedStories,
  allCollapsed,
  users,
  storyMenuAnchor,
  storyMenuId,
  onCollapseAll,
  onToggleStory,
  onTaskClick,
  onAddTask,
  onDeleteTask,
  onStoryMenuOpen,
  onStoryMenuClose,
  onEditStory,
  onDeleteStoryRequest,
}: BoardBodyProps) {
  return (
    <Box sx={{ px: 3, py: 2 }}>
      {/* Collapse / Expand all toggle */}
      <Box sx={{ mb: 2 }}>
        <Typography
          onClick={onCollapseAll}
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

      {/* Column headers */}
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
        {COLUMNS.map((col) => (
          <Typography key={col} sx={{ fontSize: "12px", fontWeight: 600 }}>
            {col}
          </Typography>
        ))}
      </Box>

      {/* Rows */}
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
          userStories.map((story, index) => (
            <Box key={story.id}>
              {index > 0 && <Divider />}
              <UserStoryRow
                story={story}
                tasks={storyTasks[story.id] || []}
                loadingTasks={!!loadingTasks[story.id]}
                isExpanded={!!expandedStories[story.id]}
                users={users}
                storyMenuAnchor={storyMenuAnchor}
                storyMenuId={storyMenuId}
                onToggle={onToggleStory}
                onTaskClick={onTaskClick}
                onAddTask={onAddTask}
                onDeleteTask={onDeleteTask}
                onStoryMenuOpen={onStoryMenuOpen}
                onStoryMenuClose={onStoryMenuClose}
                onEditStory={onEditStory}
                onDeleteStoryRequest={onDeleteStoryRequest}
              />
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

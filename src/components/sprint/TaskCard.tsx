import { Box, Typography, Chip, Avatar } from "@mui/material";
import { Task } from "@/services/api/tasks";

interface TaskCardProps {
  task: Task;
  borderColor: string;
  onClick: () => void;
}

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function TaskCard({
  task,
  borderColor,
  onClick,
}: TaskCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: "white",
        border: "1px solid #EDEBE9",
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: "4px",
        p: 1.5,
        mb: 1,
        cursor: "pointer",
        "&:hover": {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 16,
            height: 16,
            bgcolor: "#605E5C",
            borderRadius: "2px",
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: "12px",
            color: "#0078D4",
            fontWeight: 500,
          }}
        >
          {task.task_no}
        </Typography>
      </Box>
      <Typography
        sx={{
          fontSize: "12px",
          mb: 1,
          lineHeight: 1.4,
        }}
      >
        {task.title}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Chip
          label={task.status}
          size="small"
          sx={{
            fontSize: "10px",
            height: 18,
            bgcolor: "#F3F2F1",
          }}
        />
        {task.assigned_to && (
          <Avatar
            sx={{
              width: 20,
              height: 20,
              fontSize: "9px",
              bgcolor: "#0078D4",
            }}
          >
            {getInitials(task.assigned_to)}
          </Avatar>
        )}
      </Box>
      {task.tags && task.tags.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Chip
            label={task.tags[0]}
            size="small"
            sx={{
              fontSize: "10px",
              height: 18,
              bgcolor: "#E1DFDD",
            }}
          />
        </Box>
      )}
    </Box>
  );
}

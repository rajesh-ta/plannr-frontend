import { Box, Typography, Chip, Tooltip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import { Task } from "@/services/api/tasks";
import { useUserById } from "@/hooks/useUsers";

interface TaskCardProps {
  task: Task;
  borderColor: string;
  onClick: () => void;
}

export default function TaskCard({
  task,
  borderColor,
  onClick,
}: TaskCardProps) {
  const assignee = useUserById(task.assignee_id);
  const assigneeName = assignee?.name;

  const tooltipContent = task.description ? (
    <Box sx={{ maxWidth: 400 }}>
      <Typography
        sx={{
          fontWeight: 600,
          mb: 0.5,
          fontSize: "11px",
          color: "rgba(255, 255, 255, 0.7)",
        }}
      >
        Description
      </Typography>
      <Typography sx={{ fontSize: "12px", whiteSpace: "pre-wrap" }}>
        {task.description}
      </Typography>
    </Box>
  ) : null;

  const cardContent = (
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
      <Box sx={{ mb: assigneeName ? 1 : 0 }}>
        <Chip
          label={task.status}
          size="small"
          sx={{
            fontSize: "10px",
            height: 18,
            bgcolor: "#F3F2F1",
          }}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: task.tags && task.tags.length > 0 ? 1 : 0,
        }}
      >
        {assigneeName ? (
          <PersonIcon
            sx={{
              width: 20,
              height: 20,
              color: "#107C10",
            }}
          />
        ) : (
          <PersonOutlineIcon
            sx={{
              width: 20,
              height: 20,
              color: "#605E5C",
            }}
          />
        )}
        <Typography
          sx={{
            fontSize: "11px",
            color: "#323130",
          }}
        >
          {assigneeName || "Unassigned"}
        </Typography>
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

  return tooltipContent ? (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
      enterDelay={500}
      leaveDelay={200}
    >
      {cardContent}
    </Tooltip>
  ) : (
    cardContent
  );
}

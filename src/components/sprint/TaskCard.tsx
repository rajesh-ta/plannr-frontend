import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { getTaskStatusStyle } from "@/constants/statusColors";
import { Task } from "@/services/api/tasks";
import { useUserById } from "@/hooks/useUsers";

interface TaskCardProps {
  task: Task;
  borderColor: string;
  onClick: () => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskCard({
  task,
  borderColor,
  onClick,
  onDelete,
}: TaskCardProps) {
  const assignee = useUserById(task.assignee_id);
  const assigneeName = assignee?.name;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    onClick();
    handleMenuClose();
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
    handleMenuClose();
  };

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

  return (
    <Box
      sx={{
        bgcolor: "white",
        border: "1px solid #EDEBE9",
        borderLeft: `3px solid ${borderColor}`,
        borderRadius: "4px",
        p: 1.5,
        mb: 1,
        position: "relative",
        "&:hover": {
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        "&:hover .more-icon": {
          opacity: 1,
        },
      }}
    >
      <IconButton
        className="more-icon"
        size="small"
        onClick={handleMenuClick}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          opacity: 0,
          transition: "opacity 0.2s",
          padding: "4px",
          "&:hover": {
            bgcolor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        <MoreVertIcon sx={{ fontSize: 16 }} />
      </IconButton>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          mb: 1,
        }}
      >
        <AssignmentIcon
          sx={{ fontSize: 16, color: "#0078D4", flexShrink: 0, mt: "1px" }}
        />
        {tooltipContent ? (
          <Tooltip
            title={tooltipContent}
            placement="top"
            arrow
            enterDelay={500}
            leaveDelay={200}
          >
            <Typography
              onClick={onClick}
              sx={{
                fontSize: "12px",
                color: "#0078D4",
                fontWeight: 500,
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {task.task_no}
            </Typography>
          </Tooltip>
        ) : (
          <Typography
            onClick={onClick}
            sx={{
              fontSize: "12px",
              color: "#0078D4",
              fontWeight: 500,
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            {task.task_no}
          </Typography>
        )}
      </Box>
      <Typography
        onClick={onClick}
        sx={{
          fontSize: "12px",
          mb: 1,
          lineHeight: 1.4,
          cursor: "pointer",
          "&:hover": {
            color: "#0078D4",
          },
        }}
      >
        {task.title}
      </Typography>
      <Box sx={{ mb: assigneeName ? 1 : 0 }}>
        <Chip
          label={getTaskStatusStyle(task.status).label || task.status}
          size="small"
          sx={{
            fontSize: "10px",
            height: 18,
            bgcolor: getTaskStatusStyle(task.status).bg,
            color: getTaskStatusStyle(task.status).color,
            fontWeight: 500,
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
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => handleMenuClose()}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            minWidth: 180,
          },
        }}
      >
        <MenuItem
          onClick={handleEdit}
          sx={{
            fontSize: "13px",
            py: 1,
            gap: 1.5,
          }}
        >
          <EditOutlinedIcon sx={{ fontSize: 18 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{
            fontSize: "13px",
            py: 1,
            gap: 1.5,
            color: "#A4262C",
          }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

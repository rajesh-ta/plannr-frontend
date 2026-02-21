import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import { Close, Assignment } from "@mui/icons-material";
import { Task } from "@/services/api/tasks";

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  userStoryId?: string;
  onSave?: (updatedTask: Partial<Task>) => void;
}

const STATUS_OPTIONS = ["new", "active", "closed", "removed"];

export default function TaskDetailsDialog({
  open,
  onClose,
  task,
  userStoryId,
  onSave,
}: TaskDetailsDialogProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "new");

  // Sync state when dialog opens with a task
  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task?.id]);

  const handleSave = () => {
    if (onSave && task) {
      onSave({
        id: task.id,
        title,
        description,
        status,
      });
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog
      key={task.id}
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          pb: 2,
          pt: 2.5,
        }}
      >
        <Box>
          {/* User Story Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Assignment sx={{ fontSize: 20, color: "#0078D4" }} />
            <Typography
              variant="caption"
              sx={{
                color: "#0078D4",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              USER STORY {userStoryId || task.user_story_id}
            </Typography>
          </Box>
          {/* Task Number and Title */}
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5 }}>
            <Typography
              variant="h5"
              component="div"
              sx={{ fontWeight: 400, color: "#323130" }}
            >
              {task.task_no}
            </Typography>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 400, color: "#323130" }}
            >
              {task.title}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

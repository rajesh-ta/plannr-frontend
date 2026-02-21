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
import { useUsers } from "@/hooks/useUsers";

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
  const { data: users = [] } = useUsers();
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "new");
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || "");
  const [estimatedHours, setEstimatedHours] = useState(
    task?.estimated_hours || 0,
  );
  const [errors, setErrors] = useState({ title: false, description: false });

  // Sync state when dialog opens with a task
  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setAssigneeId(task.assignee_id || "");
      setEstimatedHours(task.estimated_hours || 0);
      setErrors({ title: false, description: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task?.id]);

  const handleSave = () => {
    // Validate required fields
    const newErrors = {
      title: !title.trim(),
      description: !description.trim(),
    };
    setErrors(newErrors);

    if (newErrors.title || newErrors.description) {
      return;
    }

    if (onSave && task) {
      onSave({
        id: task.id,
        title,
        description,
        status,
        assignee_id: assigneeId || undefined,
        estimated_hours: estimatedHours,
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
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
            error={errors.title}
            helperText={errors.title ? "Title is required" : ""}
          />

          <TextField
            label="Description"
            fullWidth
            required
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            size="small"
            error={errors.description}
            helperText={errors.description ? "Description is required" : ""}
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

          <FormControl fullWidth size="small">
            <InputLabel>Assign To</InputLabel>
            <Select
              value={assigneeId}
              label="Assign To"
              onChange={(e) => setAssigneeId(e.target.value)}
            >
              <MenuItem value="">
                <em>Unassigned</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Estimated Hours"
            fullWidth
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(Number(e.target.value) || 0)}
            size="small"
            InputProps={{
              inputProps: { min: 0, max: 1000, step: 0.5 },
            }}
          />
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

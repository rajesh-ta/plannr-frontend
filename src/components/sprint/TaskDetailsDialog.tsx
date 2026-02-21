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
import { Close, MenuBook } from "@mui/icons-material";
import { Task } from "@/services/api/tasks";
import { UserStory } from "@/services/api/userStories";
import { useUsers } from "@/hooks/useUsers";

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  userStory?: UserStory;
  onSave?: (updatedTask: Partial<Task>) => void;
}

const STATUS_OPTIONS = ["new", "active", "closed", "removed"];

export default function TaskDetailsDialog({
  open,
  onClose,
  task,
  userStory,
  onSave,
}: TaskDetailsDialogProps) {
  const { data: users = [] } = useUsers();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("new");
  const [assigneeId, setAssigneeId] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [errors, setErrors] = useState({ title: false, description: false });

  const isEditMode = !!task;

  // Sync state when dialog opens
  useEffect(() => {
    if (open) {
      if (task) {
        // Edit mode - populate with task data
        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setAssigneeId(task.assignee_id || "");
        setEstimatedHours(task.estimated_hours || 0);
      } else {
        // Add mode - reset to defaults
        setTitle("");
        setDescription("");
        setStatus("new");
        setAssigneeId("");
        setEstimatedHours(0);
      }
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

    if (onSave) {
      const taskData: Partial<Task> = {
        title,
        description,
        status,
        assignee_id: assigneeId || undefined,
        estimated_hours: estimatedHours,
      };

      if (task) {
        taskData.id = task.id;
      }

      onSave(taskData);
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      key={task?.id || "new-task"}
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
            <MenuBook sx={{ fontSize: 16, color: "#0078D4" }} />
            <Typography
              variant="caption"
              sx={{
                color: "#0078D4",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              USER STORY {userStory?.user_story_no || ""}
            </Typography>
          </Box>
          {/* Task Number and Title - Only show in edit mode */}
          {isEditMode && task && (
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
          )}
          {/* Add Task Title - Show in add mode */}
          {!isEditMode && (
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 400, color: "#323130" }}
            >
              Add New Task
            </Typography>
          )}
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
          {isEditMode ? "Save Changes" : "Add Task"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

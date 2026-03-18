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
  useMediaQuery,
  useTheme,
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
  readOnly?: boolean;
}

const STATUS_OPTIONS = ["new", "active", "closed", "removed"];

export default function TaskDetailsDialog({
  open,
  onClose,
  task,
  userStory,
  onSave,
  readOnly = false,
}: TaskDetailsDialogProps) {
  const { data: users = [] } = useUsers();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("new");
  const [assigneeId, setAssigneeId] = useState("");
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({ title: false, description: false });

  const isEditMode = !!task;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
        setStartDate(task.start_date || "");
        setEndDate(task.end_date || "");
      } else {
        // Add mode - reset to defaults
        setTitle("");
        setDescription("");
        setStatus("new");
        setAssigneeId("");
        setEstimatedHours(0);
        setStartDate("");
        setEndDate("");
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
        start_date: startDate || null,
        end_date: endDate || null,
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
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 2,
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
            required={!readOnly}
            value={title}
            onChange={(e) => !readOnly && setTitle(e.target.value)}
            size="small"
            error={!readOnly && errors.title}
            helperText={!readOnly && errors.title ? "Title is required" : ""}
            InputProps={{ readOnly }}
            sx={
              readOnly
                ? { "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA" } }
                : {}
            }
          />

          <TextField
            label="Description"
            fullWidth
            required={!readOnly}
            multiline
            rows={4}
            value={description}
            onChange={(e) => !readOnly && setDescription(e.target.value)}
            size="small"
            error={!readOnly && errors.description}
            helperText={
              !readOnly && errors.description ? "Description is required" : ""
            }
            InputProps={{ readOnly }}
            sx={
              readOnly
                ? { "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA" } }
                : {}
            }
          />

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => !readOnly && setStatus(e.target.value)}
              inputProps={{ readOnly }}
              sx={readOnly ? { bgcolor: "#FAFAFA", pointerEvents: "none" } : {}}
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
              onChange={(e) => !readOnly && setAssigneeId(e.target.value)}
              inputProps={{ readOnly }}
              sx={readOnly ? { bgcolor: "#FAFAFA", pointerEvents: "none" } : {}}
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
            onChange={(e) =>
              !readOnly && setEstimatedHours(Number(e.target.value) || 0)
            }
            size="small"
            InputProps={{
              readOnly,
              inputProps: { min: 0, max: 1000, step: 0.5 },
            }}
            sx={
              readOnly
                ? { "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA" } }
                : {}
            }
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => !readOnly && setStartDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly }}
              sx={
                readOnly
                  ? { "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA" } }
                  : {}
              }
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => !readOnly && setEndDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly }}
              inputProps={{ min: startDate || undefined }}
              sx={
                readOnly
                  ? { "& .MuiOutlinedInput-root": { bgcolor: "#FAFAFA" } }
                  : {}
              }
            />
          </Box>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          {readOnly ? "Close" : "Cancel"}
        </Button>
        {!readOnly && (
          <Button onClick={handleSave} variant="contained" color="primary">
            {isEditMode ? "Save Changes" : "Add Task"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

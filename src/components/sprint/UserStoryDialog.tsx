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
import { Sprint } from "@/services/api/sprints";
import { UserStoryCreatePayload } from "@/services/api/userStories";
import { useUsers } from "@/hooks/useUsers";

interface UserStoryDialogProps {
  open: boolean;
  onClose: () => void;
  sprints: Sprint[];
  defaultSprintId?: string;
  onSave: (payload: UserStoryCreatePayload) => Promise<void>;
}

const USER_STORY_STATUS_OPTIONS = ["new", "active", "closed", "removed"];

export default function UserStoryDialog({
  open,
  onClose,
  sprints,
  defaultSprintId,
  onSave,
}: UserStoryDialogProps) {
  const { data: users = [] } = useUsers();
  const [sprintId, setSprintId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("new");
  const [assigneeId, setAssigneeId] = useState("");
  const [errors, setErrors] = useState({
    sprintId: false,
    title: false,
    description: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSprintId(defaultSprintId || "");
      setTitle("");
      setDescription("");
      setStatus("new");
      setAssigneeId("");
      setErrors({ sprintId: false, title: false, description: false });
      setSaving(false);
    }
  }, [open, defaultSprintId]);

  const handleSave = async () => {
    const newErrors = {
      sprintId: !sprintId,
      title: !title.trim(),
      description: !description.trim(),
    };
    setErrors(newErrors);

    if (newErrors.sprintId || newErrors.title || newErrors.description) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        sprint_id: sprintId,
        title: title.trim(),
        description: description.trim(),
        status,
        assignee_id: assigneeId || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <MenuBook sx={{ fontSize: 20, color: "#0078D4" }} />
            <Typography
              variant="caption"
              sx={{ color: "#0078D4", fontWeight: 600, letterSpacing: "0.5px" }}
            >
              NEW USER STORY
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 400, color: "#323130" }}
          >
            Add User Story
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small" required error={errors.sprintId}>
            <InputLabel>Sprint</InputLabel>
            <Select
              value={sprintId}
              label="Sprint"
              onChange={(e) => setSprintId(e.target.value)}
            >
              {sprints.map((sprint) => (
                <MenuItem key={sprint.id} value={sprint.id}>
                  {sprint.name}
                </MenuItem>
              ))}
            </Select>
            {errors.sprintId && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, ml: 1.75 }}
              >
                Sprint is required
              </Typography>
            )}
          </FormControl>

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
              {USER_STORY_STATUS_OPTIONS.map((option) => (
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
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={saving}
        >
          Add User Story
        </Button>
      </DialogActions>
    </Dialog>
  );
}

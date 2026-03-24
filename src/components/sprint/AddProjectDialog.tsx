import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import {
  projectsApi,
  ProjectCreatePayload,
  Project,
} from "@/services/api/projects";
import { useAuth } from "@/hooks/useAuth";

interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  editProject?: Project | null;
}

export default function AddProjectDialog({
  open,
  onClose,
  onCreated,
  editProject,
}: AddProjectDialogProps) {
  const isEdit = !!editProject;
  const { user } = useAuth();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({ name: false, description: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editProject) {
        setName(editProject.name);
        setDescription(editProject.description ?? "");
      } else {
        setName("");
        setDescription("");
      }
      setErrors({ name: false, description: false });
      setSaving(false);
    }
  }, [open, editProject]);

  const handleSave = async () => {
    const newErrors = {
      name: !name.trim(),
      description: !description.trim(),
    };
    setErrors(newErrors);
    if (newErrors.name || newErrors.description) return;

    if (!user) return;

    setSaving(true);
    try {
      if (isEdit && editProject) {
        await projectsApi.update(editProject.id, {
          name: name.trim(),
          description: description.trim(),
        });
      } else {
        const payload: ProjectCreatePayload = {
          name: name.trim(),
          description: description.trim(),
        };
        await projectsApi.create(payload);
      }
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Failed to save project:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 2 } }}
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
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 400, color: "#323130" }}
        >
          {isEdit ? "Edit Project" : "Add Project"}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Project Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            error={errors.name}
            helperText={errors.name ? "Project name is required" : ""}
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
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderColor: "#8A8886",
            color: "#323130",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{
            textTransform: "none",
            bgcolor: "#0078D4",
            "&:hover": { bgcolor: "#106EBE" },
          }}
        >
          {saving
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save Changes"
              : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

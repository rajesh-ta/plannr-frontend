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
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { projectsApi, ProjectCreatePayload } from "@/services/api/projects";
import { useAuth } from "@/contexts/AuthContext";

interface AddProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export default function AddProjectDialog({
  open,
  onClose,
  onCreated,
}: AddProjectDialogProps) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({ name: false, description: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setErrors({ name: false, description: false });
      setSaving(false);
    }
  }, [open]);

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
      const payload: ProjectCreatePayload = {
        name: name.trim(),
        description: description.trim(),
      };
      await projectsApi.create(payload);
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Failed to create project:", err);
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
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 400, color: "#323130" }}
        >
          Add Project
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
          {saving ? "Creating…" : "Create Project"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

"use client";

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
import { Close, DirectionsRun } from "@mui/icons-material";
import { Sprint, SprintCreatePayload } from "@/services/api/sprints";
import { Project } from "@/services/api/projects";

interface SprintDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projects?: Project[];
  editSprint?: Sprint | null;
  onSave: (payload: SprintCreatePayload, id?: string) => Promise<void>;
}

const SPRINT_STATUS_OPTIONS = ["planned", "active", "completed"];

export default function SprintDialog({
  open,
  onClose,
  projectId,
  projects = [],
  editSprint,
  onSave,
}: SprintDialogProps) {
  const isEdit = !!editSprint;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [name, setName] = useState("");
  const [status, setStatus] = useState("planned");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProject, setSelectedProject] = useState(projectId);
  const [errors, setErrors] = useState({ name: false, project: false });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editSprint) {
        setName(editSprint.name);
        setStatus(editSprint.status);
        setStartDate(editSprint.start_date || "");
        setEndDate(editSprint.end_date || "");
        setSelectedProject(editSprint.project_id);
      } else {
        setName("");
        setStatus("planned");
        setStartDate("");
        setEndDate("");
        setSelectedProject(projectId);
      }
      setErrors({ name: false, project: false });
      setSaving(false);
    }
  }, [open, editSprint, projectId]);

  const handleSave = async () => {
    const newErrors = { name: !name.trim(), project: !selectedProject };
    setErrors(newErrors);
    if (newErrors.name || newErrors.project) return;

    setSaving(true);
    try {
      await onSave(
        {
          name: name.trim(),
          project_id: selectedProject,
          status,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
        editSprint?.id,
      );
      onClose();
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
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <DirectionsRun sx={{ fontSize: 20, color: "#0078D4" }} />
            <Typography
              variant="caption"
              sx={{ color: "#0078D4", fontWeight: 600, letterSpacing: "0.5px" }}
            >
              {isEdit ? "EDIT SPRINT" : "NEW SPRINT"}
            </Typography>
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 400, color: "#323130" }}
          >
            {isEdit ? "Edit Sprint" : "Add Sprint"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Project */}
          {projects.length > 0 && (
            <FormControl fullWidth size="small" error={errors.project} required>
              <InputLabel>Project</InputLabel>
              <Select
                value={selectedProject}
                label="Project"
                onChange={(e) => setSelectedProject(e.target.value)}
                disabled={isEdit}
              >
                {projects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.project && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ mt: 0.5, ml: 1.5 }}
                >
                  Project is required
                </Typography>
              )}
            </FormControl>
          )}

          {/* Name */}
          <TextField
            label="Sprint Name"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="small"
            error={errors.name}
            helperText={errors.name ? "Name is required" : ""}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              {SPRINT_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Start Date"
              type="date"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              fullWidth
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Box>
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
          {isEdit ? "Update Sprint" : "Add Sprint"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

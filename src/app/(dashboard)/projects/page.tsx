"use client";

import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useEffect, useState } from "react";
import { projectsApi, Project } from "@/services/api/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
      console.error("Error loading projects:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Projects
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={loadProjects}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {!error && projects.length === 0 && (
        <Typography color="text.secondary">
          No projects found. Create your first project to get started.
        </Typography>
      )}

      {!error && projects.length > 0 && (
        <Box>
          {projects.map((project) => (
            <Box
              key={project.id}
              sx={{
                p: 2,
                mb: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6">{project.name}</Typography>
              {project.description && (
                <Typography color="text.secondary">
                  {project.description}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Status: {project.status}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

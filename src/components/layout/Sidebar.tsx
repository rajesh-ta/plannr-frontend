"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Dashboard,
  ViewKanban,
  ExpandLess,
  ExpandMore,
  DirectionsRun,
  Description,
  Assignment,
  GridView,
} from "@mui/icons-material";
import { projectsApi, Project } from "@/services/api/projects";
import { useProject } from "@/contexts/ProjectContext";

const drawerWidth = 260;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { selectedProjectId, setSelectedProjectId } = useProject();
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsApi.getAll();
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleBoardsClick = () => {
    setBoardsOpen(!boardsOpen);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: "48px", // Height of AppBar
          bgcolor: "#F3F2F1",
          borderRight: "1px solid #EDEBE9",
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        {/* Project Selector */}
        <Box sx={{ p: 2, pb: 1 }}>
          <FormControl fullWidth size="small">
            <Select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              disabled={loading || projects.length === 0}
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                bgcolor: "white",
                "& .MuiSelect-select": {
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.75,
                },
                "& fieldset": {
                  borderColor: "#EDEBE9",
                },
                "&:hover fieldset": {
                  borderColor: "#C8C6C4",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0078D4",
                },
              }}
              renderValue={(value) => {
                const project = projects.find((p) => p.id === value);
                return <span>{project?.name || "Select a project"}</span>;
              }}
            >
              {loading ? (
                <MenuItem disabled>Loading projects...</MenuItem>
              ) : projects.length === 0 ? (
                <MenuItem disabled>No projects available</MenuItem>
              ) : (
                projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Navigation Menu */}
        <List sx={{ py: 0 }}>
          {/* Overview */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => router.push("/overview")}
              sx={{
                py: 1,
                px: 2,
                "&:hover": { bgcolor: "#EDEBE9" },
                bgcolor: pathname === "/overview" ? "#E1DFDD" : "transparent",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Dashboard sx={{ fontSize: 18, color: "#323130" }} />
              </ListItemIcon>
              <ListItemText
                primary="Overview"
                primaryTypographyProps={{
                  fontSize: "13px",
                  fontWeight: pathname === "/overview" ? 600 : 500,
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Boards */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleBoardsClick}
              sx={{
                py: 1,
                px: 2,
                "&:hover": { bgcolor: "#EDEBE9" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ViewKanban sx={{ fontSize: 18, color: "#323130" }} />
              </ListItemIcon>
              <ListItemText
                primary="Boards"
                primaryTypographyProps={{
                  fontSize: "13px",
                  fontWeight: 500,
                }}
              />
              {boardsOpen ? (
                <ExpandLess sx={{ fontSize: 18, color: "#605E5C" }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18, color: "#605E5C" }} />
              )}
            </ListItemButton>
          </ListItem>

          {/* Boards Sub-items */}
          <Collapse in={boardsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Sprint */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push("/sprint")}
                  sx={{
                    py: 0.75,
                    pl: 6,
                    pr: 2,
                    "&:hover": { bgcolor: "#EDEBE9" },
                    bgcolor: pathname === "/sprint" ? "#E1DFDD" : "transparent",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DirectionsRun sx={{ fontSize: 16, color: "#605E5C" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sprint"
                    primaryTypographyProps={{
                      fontSize: "13px",
                      fontWeight: pathname === "/sprint" ? 600 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Collapse>
        </List>
      </Box>
    </Drawer>
  );
}

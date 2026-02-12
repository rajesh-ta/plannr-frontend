"use client";

import { useState } from "react";
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

const drawerWidth = 260;

export default function Sidebar() {
  const [boardsOpen, setBoardsOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState("plannr");

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
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
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
              renderValue={(value) => (
                <span>
                  {value === "plannr"
                    ? "Plannr"
                    : value === "eiap"
                      ? "EIAP_Projects"
                      : "Demo Project"}
                </span>
              )}
            >
              <MenuItem value="plannr">Plannr</MenuItem>
              <MenuItem value="eiap">EIAP_Projects</MenuItem>
              <MenuItem value="demo">Demo Project</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Navigation Menu */}
        <List sx={{ py: 0 }}>
          {/* Overview */}
          <ListItem disablePadding>
            <ListItemButton
              sx={{
                py: 1,
                px: 2,
                "&:hover": { bgcolor: "#EDEBE9" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Dashboard sx={{ fontSize: 18, color: "#323130" }} />
              </ListItemIcon>
              <ListItemText
                primary="Overview"
                primaryTypographyProps={{
                  fontSize: "13px",
                  fontWeight: 500,
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
                  sx={{
                    py: 0.75,
                    pl: 6,
                    pr: 2,
                    "&:hover": { bgcolor: "#EDEBE9" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DirectionsRun sx={{ fontSize: 16, color: "#605E5C" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Sprint"
                    primaryTypographyProps={{
                      fontSize: "13px",
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* User Story */}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    py: 0.75,
                    pl: 6,
                    pr: 2,
                    "&:hover": { bgcolor: "#EDEBE9" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Description sx={{ fontSize: 16, color: "#605E5C" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="User Story"
                    primaryTypographyProps={{
                      fontSize: "13px",
                    }}
                  />
                </ListItemButton>
              </ListItem>

              {/* Task */}
              <ListItem disablePadding>
                <ListItemButton
                  sx={{
                    py: 0.75,
                    pl: 6,
                    pr: 2,
                    "&:hover": { bgcolor: "#EDEBE9" },
                    bgcolor: "#E1DFDD",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Assignment sx={{ fontSize: 16, color: "#605E5C" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary="Task"
                    primaryTypographyProps={{
                      fontSize: "13px",
                      fontWeight: 600,
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

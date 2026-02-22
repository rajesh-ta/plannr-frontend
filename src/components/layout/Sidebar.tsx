"use client";

import { useState } from "react";
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
} from "@mui/material";
import {
  Dashboard,
  ViewKanban,
  ExpandLess,
  ExpandMore,
  AdminPanelSettings,
  DashboardCustomize,
} from "@mui/icons-material";

const drawerWidth = 260;

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [boardsOpen, setBoardsOpen] = useState(true);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          mt: "48px",
          bgcolor: "#F3F2F1",
          borderRight: "1px solid #EDEBE9",
        },
      }}
    >
      <Box sx={{ overflow: "auto" }}>
        <List sx={{ py: 1 }}>
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

          {/* Admin */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => router.push("/admin")}
              sx={{
                py: 1,
                px: 2,
                "&:hover": { bgcolor: "#EDEBE9" },
                bgcolor: pathname === "/admin" ? "#E1DFDD" : "transparent",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <AdminPanelSettings
                  sx={{
                    fontSize: 18,
                    color: pathname === "/admin" ? "#0078D4" : "#323130",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary="Admin"
                primaryTypographyProps={{
                  fontSize: "13px",
                  fontWeight: pathname === "/admin" ? 600 : 500,
                  color: pathname === "/admin" ? "#0078D4" : "inherit",
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Boards */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setBoardsOpen(!boardsOpen)}
              sx={{ py: 1, px: 2, "&:hover": { bgcolor: "#EDEBE9" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ViewKanban sx={{ fontSize: 18, color: "#323130" }} />
              </ListItemIcon>
              <ListItemText
                primary="Boards"
                primaryTypographyProps={{ fontSize: "13px", fontWeight: 500 }}
              />
              {boardsOpen ? (
                <ExpandLess sx={{ fontSize: 18, color: "#605E5C" }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18, color: "#605E5C" }} />
              )}
            </ListItemButton>
          </ListItem>

          {/* Boards sub-items */}
          <Collapse in={boardsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Projects */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => router.push("/projects")}
                  sx={{
                    py: 0.75,
                    pl: 5,
                    pr: 2,
                    "&:hover": { bgcolor: "#EDEBE9" },
                    bgcolor:
                      pathname === "/projects" ? "#E1DFDD" : "transparent",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DashboardCustomize
                      sx={{
                        fontSize: 16,
                        color: pathname === "/projects" ? "#0078D4" : "#605E5C",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary="Projects"
                    primaryTypographyProps={{
                      fontSize: "13px",
                      fontWeight: pathname === "/projects" ? 600 : 400,
                      color: pathname === "/projects" ? "#0078D4" : "inherit",
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

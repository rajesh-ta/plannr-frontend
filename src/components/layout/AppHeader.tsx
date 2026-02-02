"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
} from "@mui/material";
import {
  Notifications,
  Settings,
  AccountCircle,
  GridView,
} from "@mui/icons-material";

export default function AppHeader() {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: "#323130",
        boxShadow: "none",
        borderBottom: "1px solid #605E5C",
      }}
    >
      <Toolbar sx={{ minHeight: "48px !important", px: 2 }}>
        {/* App Name */}
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexGrow: 1 }}
        >
          <GridView sx={{ fontSize: 20, color: "white" }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              fontSize: "18px",
              color: "white",
            }}
          >
            Plannr
          </Typography>
        </Box>

        {/* Right side icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Notifications */}
          <IconButton size="small" sx={{ color: "white" }}>
            <Badge badgeContent={3} color="error">
              <Notifications fontSize="small" />
            </Badge>
          </IconButton>

          {/* Settings */}
          <IconButton size="small" sx={{ color: "white" }}>
            <Settings fontSize="small" />
          </IconButton>

          {/* Profile */}
          <IconButton size="small" sx={{ color: "white", ml: 1 }}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "#0078D4",
                fontSize: "12px",
              }}
            >
              JC
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

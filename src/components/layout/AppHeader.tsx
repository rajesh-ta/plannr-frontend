"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  Notifications,
  Settings,
  GridView,
  Logout,
  Person,
} from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    router.replace("/login");
  };

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
          <IconButton
            size="small"
            sx={{ color: "white", ml: 1 }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar
              src={user?.avatar_url ?? undefined}
              sx={{
                width: 28,
                height: 28,
                bgcolor: "#9775fa",
                fontSize: "12px",
              }}
            >
              {initials}
            </Avatar>
          </IconButton>

          {/* User menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: { bgcolor: "#2d2d3f", color: "white", minWidth: 200 },
            }}
          >
            <MenuItem disabled>
              <ListItemIcon>
                <Person fontSize="small" sx={{ color: "grey.400" }} />
              </ListItemIcon>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {user?.name ?? "User"}
                </Typography>
                <Typography variant="caption" sx={{ color: "grey.400" }}>
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
            <MenuItem onClick={handleLogout} sx={{ color: "#f06595" }}>
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: "#f06595" }} />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

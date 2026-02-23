"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfileMenu() {
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
    <>
      <IconButton
        size="small"
        sx={{ color: "white", ml: 1 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Avatar
          src={user?.avatar_url ?? undefined}
          sx={{ width: 28, height: 28, bgcolor: "#9775fa", fontSize: "12px" }}
        >
          {initials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#ffffff",
              minWidth: 260,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              border: "1px solid #e1dfdd",
              borderRadius: 2,
              overflow: "hidden",
              mt: 0.5,
            },
          },
        }}
      >
        {/* Profile header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            background: "linear-gradient(135deg, #f3f2f1 0%, #edebe9 100%)",
            borderBottom: "1px solid #e1dfdd",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <Avatar
            src={user?.avatar_url ?? undefined}
            sx={{
              width: 42,
              height: 42,
              bgcolor: "#9775fa",
              fontSize: "16px",
              fontWeight: 700,
              boxShadow: "0 2px 8px rgba(151,117,250,0.4)",
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ color: "#201f1e", fontWeight: 700, lineHeight: 1.3 }}
            >
              {user?.name ?? "User"}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#605E5C",
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>

        {/* Sign out */}
        <MenuItem
          onClick={handleLogout}
          sx={{
            px: 2.5,
            py: 1.5,
            color: "#d13438",
            gap: 1.5,
            "&:hover": { bgcolor: "#fdf3f3" },
          }}
        >
          <Logout fontSize="small" sx={{ color: "#d13438" }} />
          <Typography variant="body2" fontWeight={500}>
            Sign out
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}

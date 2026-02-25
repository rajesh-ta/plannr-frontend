"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
} from "@mui/material";
import { Notifications, Settings, GridView } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import ProfileMenu from "@/components/layout/ProfileMenu";

export default function AppHeader() {
  const router = useRouter();

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
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Box
            onClick={() => router.push("/overview")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
            }}
          >
            <GridView sx={{ fontSize: 20, color: "white" }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 600, fontSize: "18px", color: "white" }}
            >
              Plannr
            </Typography>
          </Box>
        </Box>

        {/* Right side icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* <IconButton size="small" sx={{ color: "white" }}>
            <Badge badgeContent={3} color="error">
              <Notifications fontSize="small" />
            </Badge>
          </IconButton>

          <IconButton size="small" sx={{ color: "white" }}>
            <Settings fontSize="small" />
          </IconButton> */}

          <ProfileMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

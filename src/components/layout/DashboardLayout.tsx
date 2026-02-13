"use client";

import { Box } from "@mui/material";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppHeader />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // ml: "260px",
          mt: "48px",
          // width: "calc(100% - 260px)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

"use client";

import { Box } from "@mui/material";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import { ProjectProvider } from "@/contexts/ProjectContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProjectProvider>
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <AppHeader />
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            mt: "48px",
          }}
        >
          {children}
        </Box>
      </Box>
    </ProjectProvider>
  );
}

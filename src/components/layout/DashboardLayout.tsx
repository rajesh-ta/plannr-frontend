"use client";

import { useEffect } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.status === "INACTIVE") {
      router.replace("/inactive");
    }
  }, [user, loading, router]);

  // Don't render the dashboard for inactive users
  if (!loading && user?.status === "INACTIVE") {
    return null;
  }

  return (
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
  );
}

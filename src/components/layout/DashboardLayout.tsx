"use client";

import { useEffect, useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <AppHeader onMenuToggle={() => setMobileOpen(!mobileOpen)} />
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "48px",
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

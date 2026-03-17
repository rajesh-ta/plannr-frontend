"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Alert } from "@mui/material";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStats from "@/components/admin/AdminStats";
import UsersDataGrid from "@/components/admin/UsersDataGrid";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppSelector } from "@/store/hooks";
import { useAdminData } from "@/hooks/useAdminData";

export default function AdminPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const authLoading = useAppSelector((s) => s.auth.loading);

  const hasAccess = !authLoading && can("admin:read");

  const { users, roles, modifierNames, loading, error, setError, fetchData } =
    useAdminData(hasAccess);

  useEffect(() => {
    if (!authLoading && !can("admin:read")) {
      router.replace("/overview");
    }
  }, [authLoading, can, router]);

  if (authLoading || loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        // Desktop: fill viewport so DataGrid scrolls within itself
        // Tablet/Mobile: natural height so the whole page scrolls
        height: { md: "calc(100vh - 48px)" },
        display: "flex",
        flexDirection: "column",
        overflow: { xs: "visible", md: "hidden" },
      }}
    >
      <AdminHeader />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AdminStats users={users} />

      <Box sx={{ flex: 1, minHeight: 0 }}>
        <UsersDataGrid
          users={users}
          roles={roles}
          modifierNames={modifierNames}
          onRefresh={fetchData}
          onError={setError}
          canWrite={can("admin:write")}
        />
      </Box>
    </Box>
  );
}

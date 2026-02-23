"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress, Alert } from "@mui/material";
import { usersApi, User } from "@/services/api/users";
import { rolesApi, Role } from "@/services/api/roles";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStats from "@/components/admin/AdminStats";
import UsersDataGrid from "@/components/admin/UsersDataGrid";
import { usePermissions } from "@/hooks/usePermissions";
import { useAppSelector } from "@/store/hooks";

export default function AdminPage() {
  const router = useRouter();
  const { can } = usePermissions();
  const authLoading = useAppSelector((s) => s.auth.loading);

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // userId → modifier display name, resolved from the loaded user list
  const [modifierNames, setModifierNames] = useState<Record<string, string>>(
    {},
  );

  // Redirect to /overview if the user lacks admin:read — wait until auth resolves
  useEffect(() => {
    if (!authLoading && !can("admin:read")) {
      router.replace("/overview");
    }
  }, [authLoading, can, router]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, rolesData] = await Promise.all([
        usersApi.getAll(),
        rolesApi.getAll(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);

      const idToName: Record<string, string> = {};
      usersData.forEach((u) => {
        idToName[u.id] = u.name;
      });
      const modifiers: Record<string, string> = {};
      usersData.forEach((u) => {
        if (u.last_modified_by) {
          modifiers[u.id] = idToName[u.last_modified_by] ?? "Unknown";
        }
      });
      setModifierNames(modifiers);
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Don't fetch until we know the user has access
    if (!authLoading && can("admin:read")) {
      fetchData();
    }
  }, [authLoading, can, fetchData]);

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
        p: 3,
        height: "calc(100vh - 48px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { Box, CircularProgress, Alert } from "@mui/material";
import { usersApi, User } from "@/services/api/users";
import { rolesApi, Role } from "@/services/api/roles";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminStats from "@/components/admin/AdminStats";
import UsersDataGrid from "@/components/admin/UsersDataGrid";

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // userId → modifier display name, resolved from the loaded user list
  const [modifierNames, setModifierNames] = useState<Record<string, string>>(
    {},
  );

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
    fetchData();
  }, [fetchData]);

  if (loading) {
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
        />
      </Box>
    </Box>
  );
}

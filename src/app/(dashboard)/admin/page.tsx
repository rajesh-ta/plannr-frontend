"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  SelectChangeEvent,
} from "@mui/material";
import {
  AdminPanelSettings,
  Edit,
  Check,
  Close,
  Person,
} from "@mui/icons-material";
import { usersApi, User, UserUpdate } from "@/services/api/users";
import { rolesApi, Role } from "@/services/api/roles";

// ── helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<
  string,
  "success" | "error" | "warning" | "default"
> = {
  ACTIVE: "success",
  INACTIVE: "error",
  SUSPENDED: "warning",
};

const ROLE_LABELS: Record<string, string> = {
  PROJECT_ADMIN: "Admin",
  PROJECT_MANAGER: "Manager",
  PROJECT_DEVELOPER: "Developer",
  PROJECT_VIEWER: "Viewer",
};

const ROLE_COLORS: Record<string, string> = {
  PROJECT_ADMIN: "#D13438",
  PROJECT_MANAGER: "#0078D4",
  PROJECT_DEVELOPER: "#107C10",
  PROJECT_VIEWER: "#605E5C",
};

function formatDate(isoString: string | null): string {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

// ── component ─────────────────────────────────────────────────────────────────
interface EditingState {
  userId: string;
  field: "role" | "status";
  value: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);

  // Map userId → modifier name (resolved lazily)
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

      // Resolve modifier names from the already-loaded user list
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

  // ── inline edit ────────────────────────────────────────────────────────────
  const startEdit = (
    userId: string,
    field: "role" | "status",
    currentValue: string,
  ) => {
    setEditing({ userId, field, value: currentValue });
  };

  const cancelEdit = () => setEditing(null);

  const commitEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: UserUpdate = {};
      if (editing.field === "status") {
        payload.status = editing.value;
      } else {
        const role = roles.find((r) => r.role_name === editing.value);
        if (role) payload.role_id = role.id;
      }
      await usersApi.update(editing.userId, payload);
      await fetchData();
      setEditing(null);
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
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
    <Box sx={{ p: 3 }}>
      {/* ── Header ── */}
      <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
        <AdminPanelSettings sx={{ fontSize: 28, color: "#0078D4" }} />
        <Box>
          <Typography variant="h5" fontWeight={600} color="#323130">
            Admin Panel
          </Typography>
          <Typography variant="body2" color="#605E5C">
            Manage users, roles, and access levels across the project.
          </Typography>
        </Box>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Stats row ── */}
      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        {[
          { label: "Total Users", value: users.length, color: "#0078D4" },
          {
            label: "Active",
            value: users.filter((u) => u.status === "ACTIVE").length,
            color: "#107C10",
          },
          {
            label: "Inactive",
            value: users.filter((u) => u.status !== "ACTIVE").length,
            color: "#D13438",
          },
          {
            label: "Admins",
            value: users.filter((u) => u.role_name === "PROJECT_ADMIN").length,
            color: "#8764B8",
          },
        ].map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              px: 2.5,
              py: 1.5,
              border: "1px solid #EDEBE9",
              borderRadius: 2,
              minWidth: 110,
            }}
          >
            <Typography variant="h5" fontWeight={700} color={stat.color}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="#605E5C">
              {stat.label}
            </Typography>
          </Paper>
        ))}
      </Stack>

      {/* ── User table ── */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid #EDEBE9", borderRadius: 2 }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#F3F2F1" }}>
              {[
                "Full Name",
                "Email ID",
                "Role",
                "Status",
                "Last Modified On",
                "Last Modified By",
              ].map((col) => (
                <TableCell
                  key={col}
                  sx={{
                    fontWeight: 600,
                    fontSize: "12px",
                    color: "#323130",
                    py: 1.25,
                    borderBottom: "1px solid #EDEBE9",
                  }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                  sx={{ py: 6, color: "#605E5C" }}
                >
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const displayRole = user.role_name ?? "—";
                const isEditingRole =
                  editing?.userId === user.id && editing.field === "role";
                const isEditingStatus =
                  editing?.userId === user.id && editing.field === "status";

                return (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      "&:last-child td": { borderBottom: 0 },
                      borderBottom: "1px solid #EDEBE9",
                    }}
                  >
                    {/* Full Name */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          src={user.avatar_url ?? undefined}
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            bgcolor: "#0078D4",
                          }}
                        >
                          {user.avatar_url ? null : (
                            <Person sx={{ fontSize: 16 }} />
                          )}
                        </Avatar>
                        <Typography
                          fontSize={13}
                          fontWeight={500}
                          color="#323130"
                        >
                          {user.name}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Email */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography fontSize={13} color="#605E5C">
                        {user.email}
                      </Typography>
                    </TableCell>

                    {/* Role — inline editable */}
                    <TableCell sx={{ py: 1.25, minWidth: 200 }}>
                      {isEditingRole ? (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Select
                            size="small"
                            value={editing.value}
                            onChange={(e: SelectChangeEvent) =>
                              setEditing({ ...editing, value: e.target.value })
                            }
                            sx={{ fontSize: 12, minWidth: 160 }}
                            disabled={saving}
                          >
                            {roles.map((r) => (
                              <MenuItem key={r.id} value={r.role_name}>
                                {ROLE_LABELS[r.role_name] ?? r.role_name}
                              </MenuItem>
                            ))}
                          </Select>
                          <Tooltip title="Save">
                            <span>
                              <IconButton
                                size="small"
                                onClick={commitEdit}
                                disabled={saving}
                              >
                                <Check
                                  fontSize="small"
                                  sx={{ color: "#107C10" }}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              <Close
                                fontSize="small"
                                sx={{ color: "#D13438" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Chip
                            label={ROLE_LABELS[displayRole] ?? displayRole}
                            size="small"
                            sx={{
                              fontSize: "11px",
                              fontWeight: 600,
                              bgcolor:
                                ROLE_COLORS[displayRole] + "18" ?? "#F3F2F1",
                              color: ROLE_COLORS[displayRole] ?? "#323130",
                              border: `1px solid ${ROLE_COLORS[displayRole] ?? "#EDEBE9"}`,
                            }}
                          />
                          <Tooltip title="Edit role">
                            <IconButton
                              size="small"
                              onClick={() =>
                                startEdit(user.id, "role", displayRole)
                              }
                            >
                              <Edit sx={{ fontSize: 14, color: "#605E5C" }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>

                    {/* Status — inline editable */}
                    <TableCell sx={{ py: 1.25, minWidth: 160 }}>
                      {isEditingStatus ? (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Select
                            size="small"
                            value={editing.value}
                            onChange={(e: SelectChangeEvent) =>
                              setEditing({ ...editing, value: e.target.value })
                            }
                            sx={{ fontSize: 12, minWidth: 120 }}
                            disabled={saving}
                          >
                            {["ACTIVE", "INACTIVE", "SUSPENDED"].map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                          <Tooltip title="Save">
                            <span>
                              <IconButton
                                size="small"
                                onClick={commitEdit}
                                disabled={saving}
                              >
                                <Check
                                  fontSize="small"
                                  sx={{ color: "#107C10" }}
                                />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Cancel">
                            <IconButton
                              size="small"
                              onClick={cancelEdit}
                              disabled={saving}
                            >
                              <Close
                                fontSize="small"
                                sx={{ color: "#D13438" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      ) : (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <Chip
                            label={user.status}
                            size="small"
                            color={STATUS_COLORS[user.status] ?? "default"}
                            variant="outlined"
                            sx={{ fontSize: "11px", fontWeight: 600 }}
                          />
                          <Tooltip title="Edit status">
                            <IconButton
                              size="small"
                              onClick={() =>
                                startEdit(user.id, "status", user.status)
                              }
                            >
                              <Edit sx={{ fontSize: 14, color: "#605E5C" }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      )}
                    </TableCell>

                    {/* Last Modified On */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography fontSize={12} color="#605E5C">
                        {formatDate(user.last_modified_on)}
                      </Typography>
                    </TableCell>

                    {/* Last Modified By */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Typography fontSize={12} color="#605E5C">
                        {modifierNames[user.id] ?? "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

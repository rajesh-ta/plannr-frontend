"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import {
  Avatar,
  Box,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Person, Search } from "@mui/icons-material";
import { User, UserUpdate, usersApi } from "@/services/api/users";
import { Role } from "@/services/api/roles";
import { EditingState, formatDate } from "./adminConstants";
import UserRoleCell from "./UserRoleCell";
import UserStatusCell from "./UserStatusCell";

interface UsersDataGridProps {
  users: User[];
  roles: Role[];
  modifierNames: Record<string, string>;
  onRefresh: () => Promise<void>;
  onError: (msg: string) => void;
  canWrite?: boolean;
}

// Colour map for the status dot on mobile cards
const STATUS_DOT: Record<string, string> = {
  ACTIVE: "#107C10",
  INACTIVE: "#D13438",
  SUSPENDED: "#FFA500",
};

export default function UsersDataGrid({
  users,
  roles,
  modifierNames,
  onRefresh,
  onError,
  canWrite = true,
}: UsersDataGridProps) {
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));

  const startEdit = useCallback(
    (userId: string, field: "role" | "status", value: string) => {
      setEditing({ userId, field, value });
    },
    [],
  );
  const changeEdit = useCallback(
    (value: string) => setEditing((prev) => (prev ? { ...prev, value } : null)),
    [],
  );
  const cancelEdit = useCallback(() => setEditing(null), []);

  const commitEdit = useCallback(async () => {
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
      await onRefresh();
      setEditing(null);
    } catch {
      onError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }, [editing, roles, onRefresh, onError]);

  // ── Filtered list used by the mobile card view ──────────────────────────────
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role_name ?? "").toLowerCase().includes(q),
    );
  }, [users, search]);

  // ── Mobile card layout (xs only) ────────────────────────────────────────────
  if (isMobile) {
    return (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #EDEBE9",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Search bar — mirrors DataGrid toolbar */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #EDEBE9",
            bgcolor: "#FAFAFA",
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by name, email or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 16, color: "#A19F9D" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiOutlinedInput-root": { fontSize: 13 } }}
          />
        </Box>

        {/* Cards */}
        {filteredUsers.length === 0 ? (
          <Box sx={{ py: 5, textAlign: "center" }}>
            <Typography fontSize={13} color="#A19F9D">
              No users match your search.
            </Typography>
          </Box>
        ) : (
          filteredUsers.map((user, idx) => (
            <Box key={user.id}>
              {idx > 0 && <Divider />}
              <Box sx={{ px: 2, py: 2 }}>
                {/* Row 1: Avatar + Name + email */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Avatar
                    src={user.avatar_url ?? undefined}
                    sx={{
                      width: 40,
                      height: 40,
                      fontSize: 14,
                      fontWeight: 700,
                      bgcolor: "#0078D4",
                      flexShrink: 0,
                    }}
                  >
                    {user.avatar_url ? null : <Person sx={{ fontSize: 20 }} />}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      fontSize={14}
                      fontWeight={600}
                      color="#323130"
                      noWrap
                    >
                      {user.name}
                    </Typography>
                    <Typography fontSize={12} color="#605E5C" noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                  {/* Status indicator dot */}
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: STATUS_DOT[user.status] ?? "#A19F9D",
                      flexShrink: 0,
                    }}
                  />
                </Box>

                {/* Row 2: Role + Status controls */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    pl: "56px", // indent under avatar
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      fontSize={11}
                      fontWeight={600}
                      color="#A19F9D"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      Role
                    </Typography>
                    <UserRoleCell
                      userId={user.id}
                      roleName={user.role_name}
                      roles={roles}
                      editing={editing}
                      saving={saving}
                      canEdit={canWrite}
                      onStartEdit={startEdit}
                      onChangeEdit={changeEdit}
                      onCommit={commitEdit}
                      onCancel={cancelEdit}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      fontSize={11}
                      fontWeight={600}
                      color="#A19F9D"
                      sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                      Status
                    </Typography>
                    <UserStatusCell
                      userId={user.id}
                      status={user.status}
                      editing={editing}
                      saving={saving}
                      canEdit={canWrite}
                      onStartEdit={startEdit}
                      onChangeEdit={changeEdit}
                      onCommit={commitEdit}
                      onCancel={cancelEdit}
                    />
                  </Box>
                </Box>

                {/* Row 3: Last modified */}
                {(user.last_modified_on || modifierNames[user.id]) && (
                  <Typography
                    fontSize={11}
                    color="#A19F9D"
                    sx={{ mt: 1, pl: "56px" }}
                  >
                    Modified{" "}
                    {user.last_modified_on
                      ? formatDate(user.last_modified_on)
                      : "—"}
                    {modifierNames[user.id]
                      ? ` · by ${modifierNames[user.id]}`
                      : ""}
                  </Typography>
                )}
              </Box>
            </Box>
          ))
        )}
      </Paper>
    );
  }

  // ── DataGrid layout (sm+) ────────────────────────────────────────────────────
  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Full Name",
      flex: 1.5,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1} alignItems="center" height="100%">
          <Avatar
            src={(params.row as User).avatar_url ?? undefined}
            sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "#0078D4" }}
          >
            {(params.row as User).avatar_url ? null : (
              <Person sx={{ fontSize: 16 }} />
            )}
          </Avatar>
          <Typography fontSize={13} fontWeight={500} color="#323130">
            {(params.row as User).name}
          </Typography>
        </Stack>
      ),
    },
    {
      field: "email",
      headerName: "Email ID",
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          fontSize={13}
          color="#605E5C"
          sx={{ display: "flex", alignItems: "center", height: "100%" }}
        >
          {(params.row as User).email}
        </Typography>
      ),
    },
    {
      field: "role_name",
      headerName: "Role",
      flex: 1.5,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" height="100%">
          <UserRoleCell
            userId={(params.row as User).id}
            roleName={(params.row as User).role_name}
            roles={roles}
            editing={editing}
            saving={saving}
            canEdit={canWrite}
            onStartEdit={startEdit}
            onChangeEdit={changeEdit}
            onCommit={commitEdit}
            onCancel={cancelEdit}
          />
        </Stack>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1.2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" alignItems="center" height="100%">
          <UserStatusCell
            userId={(params.row as User).id}
            status={(params.row as User).status}
            editing={editing}
            saving={saving}
            canEdit={canWrite}
            onStartEdit={startEdit}
            onChangeEdit={changeEdit}
            onCommit={commitEdit}
            onCancel={cancelEdit}
          />
        </Stack>
      ),
    },
    {
      field: "last_modified_on",
      headerName: "Last Modified On",
      flex: 1.5,
      minWidth: 160,
      type: "string",
      valueGetter: (_value: unknown, row: User) =>
        formatDate(row.last_modified_on),
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          fontSize={12}
          color="#605E5C"
          sx={{ display: "flex", alignItems: "center", height: "100%" }}
        >
          {formatDate((params.row as User).last_modified_on)}
        </Typography>
      ),
    },
    {
      field: "last_modified_by",
      headerName: "Last Modified By",
      flex: 1.2,
      minWidth: 150,
      valueGetter: (_value: unknown, row: User) => modifierNames[row.id] ?? "—",
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          fontSize={12}
          color="#605E5C"
          sx={{ display: "flex", alignItems: "center", height: "100%" }}
        >
          {modifierNames[(params.row as User).id] ?? "—"}
        </Typography>
      ),
    },
  ];

  return (
    <DataGrid
      rows={users}
      columns={columns}
      rowHeight={56}
      disableRowSelectionOnClick
      autoHeight={isCompact}
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 300 },
        },
      }}
      sx={{
        height: isCompact ? "auto" : "100%",
        border: "1px solid #EDEBE9",
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        "& .MuiDataGrid-columnHeader": { bgcolor: "#F3F2F1" },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 600,
          fontSize: "12px",
          color: "#323130",
        },
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid #EDEBE9",
          overflow: "visible !important",
        },
        "& .MuiDataGrid-row": { overflow: "visible" },
        "& .MuiDataGrid-virtualScrollerRenderZone": { overflow: "visible" },
        "& .MuiDataGrid-row:hover": { bgcolor: "#FAF9F8" },
        "& .MuiDataGrid-toolbarContainer": {
          px: 2,
          pt: 1,
          pb: 1,
          borderBottom: "1px solid #EDEBE9",
          bgcolor: "#FAFAFA",
        },
        "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #EDEBE9" },
      }}
    />
  );
}

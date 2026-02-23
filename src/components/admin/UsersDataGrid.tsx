"use client";

import { useState, useCallback } from "react";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridToolbar,
} from "@mui/x-data-grid";
import { Avatar, Stack, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
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
  /** When false, all inline edit controls (role / status) are hidden. */
  canWrite?: boolean;
}

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

  const startEdit = useCallback(
    (userId: string, field: "role" | "status", value: string) => {
      setEditing({ userId, field, value });
    },
    [],
  );

  const changeEdit = useCallback((value: string) => {
    setEditing((prev) => (prev ? { ...prev, value } : null));
  }, []);

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
      slots={{ toolbar: GridToolbar }}
      slotProps={{
        toolbar: {
          showQuickFilter: true,
          quickFilterProps: { debounceMs: 300 },
        },
      }}
      sx={{
        height: "100%",
        border: "1px solid #EDEBE9",
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        "& .MuiDataGrid-columnHeader": {
          bgcolor: "#F3F2F1",
        },
        "& .MuiDataGrid-columnHeaderTitle": {
          fontWeight: 600,
          fontSize: "12px",
          color: "#323130",
        },
        // Allow edit controls (Select + action buttons) to visually overflow
        // horizontally without being clipped by the cell boundary
        "& .MuiDataGrid-cell": {
          borderBottom: "1px solid #EDEBE9",
          overflow: "visible !important",
        },
        "& .MuiDataGrid-row": {
          overflow: "visible",
        },
        "& .MuiDataGrid-virtualScrollerRenderZone": {
          overflow: "visible",
        },
        "& .MuiDataGrid-row:hover": {
          bgcolor: "#FAF9F8",
        },
        "& .MuiDataGrid-toolbarContainer": {
          px: 2,
          pt: 1,
          pb: 1,
          borderBottom: "1px solid #EDEBE9",
          bgcolor: "#FAFAFA",
        },
        "& .MuiDataGrid-footerContainer": {
          borderTop: "1px solid #EDEBE9",
        },
      }}
    />
  );
}

"use client";

import {
  Chip,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
} from "@mui/material";
import { Check, Close, Edit } from "@mui/icons-material";
import { Role } from "@/services/api/roles";
import { EditingState, ROLE_COLORS, ROLE_LABELS } from "./adminConstants";

interface UserRoleCellProps {
  userId: string;
  roleName: string | null;
  roles: Role[];
  editing: EditingState | null;
  saving: boolean;
  /** When false the inline edit pencil is hidden (read-only view). */
  canEdit?: boolean;
  onStartEdit: (
    userId: string,
    field: "role" | "status",
    value: string,
  ) => void;
  onChangeEdit: (value: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}

export default function UserRoleCell({
  userId,
  roleName,
  roles,
  editing,
  saving,
  canEdit = true,
  onStartEdit,
  onChangeEdit,
  onCommit,
  onCancel,
}: UserRoleCellProps) {
  const displayRole = roleName ?? "—";
  const isEditing = editing?.userId === userId && editing.field === "role";

  if (isEditing) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Select
          size="small"
          value={editing.value}
          onChange={(e: SelectChangeEvent) => onChangeEdit(e.target.value)}
          sx={{ fontSize: 12, minWidth: 130 }}
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
            <IconButton size="small" onClick={onCommit} disabled={saving}>
              <Check fontSize="small" sx={{ color: "#107C10" }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Cancel">
          <IconButton size="small" onClick={onCancel} disabled={saving}>
            <Close fontSize="small" sx={{ color: "#D13438" }} />
          </IconButton>
        </Tooltip>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Chip
        label={ROLE_LABELS[displayRole] ?? displayRole}
        size="small"
        sx={{
          fontSize: "11px",
          fontWeight: 600,
          bgcolor: (ROLE_COLORS[displayRole] ?? "#605E5C") + "18",
          color: ROLE_COLORS[displayRole] ?? "#323130",
          border: `1px solid ${ROLE_COLORS[displayRole] ?? "#EDEBE9"}`,
        }}
      />
      {canEdit && (
        <Tooltip title="Edit role">
          <IconButton
            size="small"
            onClick={() => onStartEdit(userId, "role", displayRole)}
          >
            <Edit sx={{ fontSize: 14, color: "#605E5C" }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

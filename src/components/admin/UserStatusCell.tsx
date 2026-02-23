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
import { EditingState, STATUS_COLORS } from "./adminConstants";

interface UserStatusCellProps {
  userId: string;
  status: string;
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

export default function UserStatusCell({
  userId,
  status,
  editing,
  saving,
  canEdit = true,
  onStartEdit,
  onChangeEdit,
  onCommit,
  onCancel,
}: UserStatusCellProps) {
  const isEditing = editing?.userId === userId && editing.field === "status";

  if (isEditing) {
    return (
      <Stack direction="row" spacing={0.5} alignItems="center">
        <Select
          size="small"
          value={editing.value}
          onChange={(e: SelectChangeEvent) => onChangeEdit(e.target.value)}
          sx={{ fontSize: 12, minWidth: 100 }}
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
        label={status}
        size="small"
        color={STATUS_COLORS[status] ?? "default"}
        variant="outlined"
        sx={{ fontSize: "11px", fontWeight: 600 }}
      />
      {canEdit && (
        <Tooltip title="Edit status">
          <IconButton
            size="small"
            onClick={() => onStartEdit(userId, "status", status)}
          >
            <Edit sx={{ fontSize: 14, color: "#605E5C" }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

// ── Shared constants & helpers for the Admin section ──────────────────────────

export const STATUS_COLORS: Record<
  string,
  "success" | "error" | "warning" | "default"
> = {
  ACTIVE: "success",
  INACTIVE: "error",
  SUSPENDED: "warning",
};

export const ROLE_LABELS: Record<string, string> = {
  PROJECT_ADMIN: "Admin",
  PROJECT_MANAGER: "Manager",
  PROJECT_DEVELOPER: "Developer",
  PROJECT_VIEWER: "Viewer",
};

export const ROLE_COLORS: Record<string, string> = {
  PROJECT_ADMIN: "#D13438",
  PROJECT_MANAGER: "#0078D4",
  PROJECT_DEVELOPER: "#107C10",
  PROJECT_VIEWER: "#605E5C",
};

export function formatDate(isoString: string | null): string {
  if (!isoString) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoString));
}

export interface EditingState {
  userId: string;
  field: "role" | "status";
  value: string;
}

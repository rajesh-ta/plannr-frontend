import { useCallback } from "react";
import { useAppSelector } from "@/store/hooks";

/**
 * usePermissions()
 *
 * Returns a `can(action)` helper that checks whether the current user's role
 * grants the requested permission.
 *
 * @example
 *   const { can } = usePermissions();
 *   if (can("task:write")) { ... }
 */
export function usePermissions() {
  const permissions = useAppSelector((s) => s.auth.user?.permissions ?? {});

  /**
   * Returns `true` when the logged-in user's role grants `action`.
   * Safely returns `false` when the user is not yet loaded.
   * Memoized so its reference only changes when `permissions` changes,
   * preventing unnecessary effect re-runs in consumers.
   */
  const can = useCallback(
    (action: string): boolean => permissions[action] === true,
    [permissions],
  );

  return { can, permissions };
}

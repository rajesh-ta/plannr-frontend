"use client";

import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  /** The permission key to check, e.g. "task:write" */
  action: string;
  /** Rendered when the user has the permission. */
  children: React.ReactNode;
  /** Optional fallback rendered when the user lacks the permission. Defaults to null. */
  fallback?: React.ReactNode;
}

/**
 * PermissionGate
 *
 * Renders `children` only when the current user's role grants `action`.
 * Renders `fallback` (default: nothing) otherwise.
 *
 * @example
 *   <PermissionGate action="task:write">
 *     <Button>Add Task</Button>
 *   </PermissionGate>
 */
export default function PermissionGate({
  action,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermissions();
  return can(action) ? <>{children}</> : <>{fallback}</>;
}

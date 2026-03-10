/**
 * Compatibility shim — ProjectContext has been migrated to Redux.
 *
 *   useProject hook  →  @/hooks/useProject
 *
 * Import from that path directly.
 */
export { useProject } from "@/hooks/useProject";
export type { UseProjectReturn } from "@/hooks/useProject";

// ProjectProvider is no longer needed (state lives in Redux).
// This passthrough keeps any remaining JSX references from breaking.
export function ProjectProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, User } from "@/services/api/users";
import { rolesApi, Role } from "@/services/api/roles";

export function useAdminData(enabled: boolean) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    data: users = [],
    isLoading: usersLoading,
    isError: usersIsError,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: usersApi.getAll,
    enabled,
  });

  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError: rolesIsError,
  } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: rolesApi.getAll,
    enabled,
  });

  const loading = usersLoading || rolesLoading;

  useEffect(() => {
    if (usersIsError || rolesIsError) {
      setError("Failed to load data. Please try again.");
    }
  }, [usersIsError, rolesIsError]);

  // Derived — no need to store in state
  const modifierNames = useMemo(() => {
    const idToName: Record<string, string> = {};
    users.forEach((u) => {
      idToName[u.id] = u.name;
    });
    const modifiers: Record<string, string> = {};
    users.forEach((u) => {
      if (u.last_modified_by) {
        modifiers[u.id] = idToName[u.last_modified_by] ?? "Unknown";
      }
    });
    return modifiers;
  }, [users]);

  // Invalidate both queries to force a fresh fetch (used by UsersDataGrid onRefresh)
  const fetchData = useCallback(() => {
    setError(null);
    queryClient.invalidateQueries({ queryKey: ["users"] });
    queryClient.invalidateQueries({ queryKey: ["roles"] });
  }, [queryClient]);

  return { users, roles, modifierNames, loading, error, setError, fetchData };
}

import { useState, useCallback, useEffect } from "react";
import { usersApi, User } from "@/services/api/users";
import { rolesApi, Role } from "@/services/api/roles";

export function useAdminData(enabled: boolean) {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [modifierNames, setModifierNames] = useState<Record<string, string>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (enabled) {
      fetchData();
    }
  }, [enabled, fetchData]);

  return { users, roles, modifierNames, loading, error, setError, fetchData };
}

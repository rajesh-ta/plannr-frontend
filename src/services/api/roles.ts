import { apiClient } from "./client";

export interface Role {
  id: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  modified_at: string;
}

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<Role[]>("/roles/");
    return response.data;
  },

  getById: async (roleId: string): Promise<Role> => {
    const response = await apiClient.get<Role>(`/roles/${roleId}`);
    return response.data;
  },
};

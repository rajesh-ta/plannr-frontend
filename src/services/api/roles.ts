import axios from "axios";
import { apiClient } from "./client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

export interface Role {
  id: string;
  role_name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  modified_at: string;
}

export const rolesApi = {
  /** Public — no auth required. Uses a plain axios instance to avoid the
   *  auth interceptor's redirect-to-login behaviour on the signup page. */
  getAll: async (): Promise<Role[]> => {
    const response = await axios.get<Role[]>(`${API_BASE_URL}/roles/`);
    return response.data;
  },

  getById: async (roleId: string): Promise<Role> => {
    const response = await apiClient.get<Role>(`/roles/${roleId}`);
    return response.data;
  },
};

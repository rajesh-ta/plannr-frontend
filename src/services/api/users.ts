import { apiClient } from "./client";

export interface User {
  id: string;
  name: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  status: string;
  last_modified_on: string | null;
  last_modified_by: string | null;
  avatar_url: string | null;
  auth_provider: string;
  created_at: string;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  role_id?: string;
  status?: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>("/users/");
    return response.data;
  },

  getById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response.data;
  },

  update: async (userId: string, data: UserUpdate): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${userId}`, data);
    return response.data;
  },

  delete: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },
};

import { apiClient } from "./client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export const usersApi = {
  getAll: async () => {
    const response = await apiClient.get<User[]>("/users/");
    return response.data;
  },
};

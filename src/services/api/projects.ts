import { apiClient } from "./client";

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export const projectsApi = {
  getAll: async () => {
    const response = await apiClient.get<Project[]>("/projects");
    return response.data;
  },
};

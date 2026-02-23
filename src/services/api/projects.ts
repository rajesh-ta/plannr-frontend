import { apiClient } from "./client";

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export interface ProjectCreatePayload {
  name: string;
  description: string;
  created_by: string;
}

export const projectsApi = {
  getAll: async () => {
    const response = await apiClient.get<Project[]>("/projects");
    return response.data;
  },

  create: async (payload: ProjectCreatePayload): Promise<Project> => {
    const response = await apiClient.post<Project>("/projects", payload);
    return response.data;
  },
};

import { apiClient } from "./client";

export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ProjectCreatePayload {
  name: string;
  description: string;
}

export interface ProjectUpdatePayload {
  name?: string;
  description?: string;
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

  update: async (
    id: string,
    payload: ProjectUpdatePayload,
  ): Promise<Project> => {
    const response = await apiClient.put<Project>(`/projects/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

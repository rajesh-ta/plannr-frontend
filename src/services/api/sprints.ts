import { apiClient } from "./client";

export interface Sprint {
  id: string;
  name: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  status: string;
  created_at: string;
}

export interface SprintCreatePayload {
  name: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  status: string;
}

export interface SprintUpdatePayload {
  name?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export const sprintsApi = {
  getByProjectId: async (projectId: string) => {
    const response = await apiClient.get<Sprint[]>(
      `/sprints/project/${projectId}`,
    );
    return response.data;
  },

  create: async (payload: SprintCreatePayload) => {
    const response = await apiClient.post<Sprint>(`/sprints/`, payload);
    return response.data;
  },

  update: async (id: string, payload: SprintUpdatePayload): Promise<Sprint> => {
    const response = await apiClient.put<Sprint>(`/sprints/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sprints/${id}`);
  },
};

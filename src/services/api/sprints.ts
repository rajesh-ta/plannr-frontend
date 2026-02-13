import { apiClient } from "./client";

export interface Sprint {
  id: string;
  name: string;
  project_id: string;
  start_date?: string;
  end_date?: string;
  status: string;
  sprint_number: number;
  created_at: string;
}

export const sprintsApi = {
  getByProjectId: async (projectId: string) => {
    const response = await apiClient.get<Sprint[]>(
      `/sprints/project/${projectId}`,
    );
    return response.data;
  },
};

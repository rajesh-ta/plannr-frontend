import { apiClient } from "./client";

export interface UserStory {
  id: string;
  user_story_no?: string;
  title: string;
  description?: string;
  sprint_id: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  assignee_id?: string;
  created_at: string;
}

export interface UserStoryCreatePayload {
  sprint_id: string;
  title: string;
  description?: string;
  status: string;
  assignee_id?: string;
}

export const userStoriesApi = {
  getBySprintId: async (sprintId: string) => {
    const response = await apiClient.get<UserStory[]>(
      `/user-stories/sprint/${sprintId}`,
    );
    return response.data;
  },

  create: async (payload: UserStoryCreatePayload) => {
    const response = await apiClient.post<UserStory>(`/user-stories/`, payload);
    return response.data;
  },

  update: async (id: string, payload: Partial<UserStoryCreatePayload>) => {
    const response = await apiClient.put<UserStory>(
      `/user-stories/${id}`,
      payload,
    );
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/user-stories/${id}`);
  },
};

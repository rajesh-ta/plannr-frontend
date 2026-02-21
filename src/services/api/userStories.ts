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
  created_at: string;
}

export const userStoriesApi = {
  getBySprintId: async (sprintId: string) => {
    const response = await apiClient.get<UserStory[]>(
      `/user-stories/sprint/${sprintId}`,
    );
    return response.data;
  },
};

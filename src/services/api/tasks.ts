import { apiClient } from "./client";

export interface Task {
  id: string;
  title: string;
  description?: string;
  user_story_id: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  tags?: string[];
  created_at: string;
}

export const tasksApi = {
  getByUserStoryId: async (userStoryId: string) => {
    const response = await apiClient.get<Task[]>(
      `/tasks/user-story/${userStoryId}`,
    );
    return response.data;
  },
};

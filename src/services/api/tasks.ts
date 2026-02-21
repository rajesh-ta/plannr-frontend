import { apiClient } from "./client";

export interface Task {
  id: string;
  task_no: string;
  title: string;
  description?: string;
  user_story_id: string;
  status: string;
  priority?: string;
  assigned_to?: string;
  tags?: string[];
  created_at: string;
  estimated_hours?: number;
  assignee_id?: string;
}

export interface TaskUpdatePayload {
  user_story_id?: string;
  title?: string;
  description?: string;
  status?: string;
  estimated_hours?: number;
  assignee_id?: string;
}

export const tasksApi = {
  getByUserStoryId: async (userStoryId: string) => {
    const response = await apiClient.get<Task[]>(
      `/tasks/user-story/${userStoryId}`,
    );
    return response.data;
  },

  update: async (taskId: string, payload: TaskUpdatePayload) => {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, payload);
    return response.data;
  },
};

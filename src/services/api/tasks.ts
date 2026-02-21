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

export interface TaskCreatePayload {
  user_story_id: string;
  title: string;
  description: string;
  status: string;
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

  create: async (payload: TaskCreatePayload) => {
    const response = await apiClient.post<Task>(`/tasks/`, payload);
    return response.data;
  },

  update: async (taskId: string, payload: TaskUpdatePayload) => {
    const response = await apiClient.put<Task>(`/tasks/${taskId}`, payload);
    return response.data;
  },

  delete: async (taskId: string) => {
    await apiClient.delete(`/tasks/${taskId}`);
  },
};

import {
  tasksApi,
  TaskCreatePayload,
  TaskUpdatePayload,
} from "@/services/api/tasks";
import { apiClient } from "@/services/api/client";

jest.mock("@/services/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedClient = apiClient as jest.Mocked<typeof apiClient>;

const mockTask = {
  id: "task-1",
  task_no: "10000006",
  title: "Add layout",
  description: "Some description",
  user_story_id: "story-1",
  status: "new",
  created_at: "2026-03-01T00:00:00Z",
};

beforeEach(() => jest.clearAllMocks());

describe("tasksApi", () => {
  describe("getAll", () => {
    it("calls GET /tasks and returns data", async () => {
      mockedClient.get.mockResolvedValueOnce({ data: [mockTask] });
      const result = await tasksApi.getAll();
      expect(mockedClient.get).toHaveBeenCalledWith("/tasks");
      expect(result).toEqual([mockTask]);
    });
  });

  describe("getByUserStoryId", () => {
    it("calls GET /tasks/user-story/:id with the correct id", async () => {
      mockedClient.get.mockResolvedValueOnce({ data: [mockTask] });
      const result = await tasksApi.getByUserStoryId("story-1");
      expect(mockedClient.get).toHaveBeenCalledWith(
        "/tasks/user-story/story-1",
      );
      expect(result).toEqual([mockTask]);
    });
  });

  describe("create", () => {
    it("calls POST /tasks/ with the full payload including dates", async () => {
      const payload: TaskCreatePayload = {
        user_story_id: "story-1",
        title: "Add layout",
        description: "Some description",
        status: "new",
        estimated_hours: 8,
        assignee_id: "user-1",
        start_date: "2026-03-10",
        end_date: "2026-03-20",
      };
      mockedClient.post.mockResolvedValueOnce({
        data: { ...mockTask, ...payload },
      });
      const result = await tasksApi.create(payload);
      expect(mockedClient.post).toHaveBeenCalledWith("/tasks/", payload);
      expect(result.start_date).toBe("2026-03-10");
      expect(result.end_date).toBe("2026-03-20");
    });

    it("sends null for start_date and end_date when not provided", async () => {
      const payload: TaskCreatePayload = {
        user_story_id: "story-1",
        title: "Task",
        description: "Desc",
        status: "new",
        start_date: null,
        end_date: null,
      };
      mockedClient.post.mockResolvedValueOnce({ data: mockTask });
      await tasksApi.create(payload);
      expect(mockedClient.post).toHaveBeenCalledWith("/tasks/", payload);
    });
  });

  describe("update", () => {
    it("calls PUT /tasks/:id with the payload", async () => {
      const payload: TaskUpdatePayload = {
        title: "Updated title",
        status: "active",
        start_date: "2026-03-15",
        end_date: "2026-03-25",
      };
      mockedClient.put.mockResolvedValueOnce({
        data: { ...mockTask, ...payload },
      });
      const result = await tasksApi.update("task-1", payload);
      expect(mockedClient.put).toHaveBeenCalledWith("/tasks/task-1", payload);
      expect(result.title).toBe("Updated title");
    });
  });

  describe("delete", () => {
    it("calls DELETE /tasks/:id", async () => {
      mockedClient.delete.mockResolvedValueOnce({});
      await tasksApi.delete("task-1");
      expect(mockedClient.delete).toHaveBeenCalledWith("/tasks/task-1");
    });
  });
});

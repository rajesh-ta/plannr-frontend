import React from "react";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskDetailsDialog from "@/components/sprint/TaskDetailsDialog";
import { renderWithProviders, makeUser } from "../test-utils";
import type { Task } from "@/services/api/tasks";

jest.mock("@/hooks/useUsers", () => ({
  useUsers: jest.fn(() => ({
    data: [
      { id: "user-1", name: "Sweta" },
      { id: "user-2", name: "Rajesh Kumar Jena" },
    ],
  })),
  useUserById: jest.fn(() => null),
}));

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    task_no: "10000006",
    title: "Add layout",
    description: "Some description",
    user_story_id: "story-1",
    status: "new",
    created_at: "2026-03-01T00:00:00Z",
    estimated_hours: 8,
    assignee_id: "user-1",
    start_date: "2026-03-10",
    end_date: "2026-03-19",
    ...overrides,
  };
}

const withTaskWritePermission = {
  preloadedState: {
    auth: {
      user: makeUser({ permissions: { "task:write": true } }),
      token: "tok",
      loading: false,
    },
  },
};

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn(),
  userStory: {
    id: "story-1",
    user_story_no: 10000002,
    title: "Create basic layout",
    description: "desc",
    status: "closed",
    sprint_id: "sprint-1",
    assignee_id: undefined,
    created_at: "2026-03-01T00:00:00Z",
  },
};

beforeEach(() => jest.clearAllMocks());

describe("TaskDetailsDialog", () => {
  describe("Add mode (task=null)", () => {
    it("shows 'Add New Task' heading", () => {
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={null} />,
        withTaskWritePermission,
      );
      expect(screen.getByText("Add New Task")).toBeInTheDocument();
    });

    it("shows 'Add Task' button in add mode", () => {
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={null} />,
        withTaskWritePermission,
      );
      expect(
        screen.getByRole("button", { name: /add task/i }),
      ).toBeInTheDocument();
    });

    it("shows validation error when title is empty and save is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={null} />,
        withTaskWritePermission,
      );
      await user.click(screen.getByRole("button", { name: /add task/i }));
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(baseProps.onSave).not.toHaveBeenCalled();
    });

    it("shows validation error when description is empty and save is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={null} />,
        withTaskWritePermission,
      );
      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, "My task");
      await user.click(screen.getByRole("button", { name: /add task/i }));
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(baseProps.onSave).not.toHaveBeenCalled();
    });

    it("calls onSave with the correct payload including start_date and end_date", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={null} />,
        withTaskWritePermission,
      );
      await user.type(screen.getByLabelText(/title/i), "My task");
      await user.type(screen.getByLabelText(/description/i), "My description");
      await user.type(screen.getByLabelText(/start date/i), "2026-03-10");
      await user.type(screen.getByLabelText(/end date/i), "2026-03-20");
      await user.click(screen.getByRole("button", { name: /add task/i }));

      expect(baseProps.onSave).toHaveBeenCalledTimes(1);
      const payload = baseProps.onSave.mock.calls[0][0];
      expect(payload.title).toBe("My task");
      expect(payload.description).toBe("My description");
      expect(payload.start_date).toBe("2026-03-10");
      expect(payload.end_date).toBe("2026-03-20");
    });
  });

  describe("Edit mode (task provided)", () => {
    it("shows task_no and task title in the header", () => {
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={makeTask()} />,
        withTaskWritePermission,
      );
      expect(screen.getByText("10000006")).toBeInTheDocument();
      expect(screen.getAllByText("Add layout").length).toBeGreaterThan(0);
    });

    it("shows 'Save Changes' button in edit mode", () => {
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={makeTask()} />,
        withTaskWritePermission,
      );
      expect(
        screen.getByRole("button", { name: /save changes/i }),
      ).toBeInTheDocument();
    });

    it("pre-populates start_date and end_date from the task", () => {
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={makeTask()} />,
        withTaskWritePermission,
      );
      const startInput = screen.getByLabelText(
        /start date/i,
      ) as HTMLInputElement;
      const endInput = screen.getByLabelText(/end date/i) as HTMLInputElement;
      expect(startInput.value).toBe("2026-03-10");
      expect(endInput.value).toBe("2026-03-19");
    });
  });

  describe("Read-only mode", () => {
    it("shows only a Close button, not Save or Add", () => {
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={makeTask()} readOnly />,
        withTaskWritePermission,
      );
      expect(
        screen.getByRole("button", { name: /close/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /save changes/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Dialog open/close", () => {
    it("does not render when open=false", () => {
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} open={false} task={null} />,
        withTaskWritePermission,
      );
      expect(screen.queryByText("Add New Task")).not.toBeInTheDocument();
    });

    it("calls onClose when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <TaskDetailsDialog {...baseProps} task={null} />,
        withTaskWritePermission,
      );
      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });
  });
});

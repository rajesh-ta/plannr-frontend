import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskCard from "@/components/sprint/TaskCard";
import { renderWithProviders, makeUser } from "../test-utils";
import type { Task } from "@/services/api/tasks";

// Mock the hook that resolves assignee names from the store
jest.mock("@/hooks/useUsers", () => ({
  useUsers: jest.fn(() => ({ data: [] })),
  useUserById: jest.fn(),
}));

import { useUserById } from "@/hooks/useUsers";
const mockedUseUserById = useUserById as jest.Mock;

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: "task-1",
    task_no: "10000006",
    title: "Add layout",
    description: "Some description",
    user_story_id: "story-1",
    status: "new",
    created_at: "2026-03-01T00:00:00Z",
    assignee_id: undefined,
    start_date: undefined,
    end_date: undefined,
    ...overrides,
  };
}

const defaultProps = {
  borderColor: "#797775",
  onClick: jest.fn(),
  onDelete: jest.fn(),
};

const withTaskWritePermission = {
  preloadedState: {
    auth: {
      user: makeUser({ permissions: { "task:write": true } }),
      token: "tok",
      loading: false,
    },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedUseUserById.mockReturnValue(null);
});

describe("TaskCard", () => {
  it("renders task_no and title", () => {
    renderWithProviders(
      <TaskCard task={makeTask()} {...defaultProps} />,
      withTaskWritePermission,
    );
    expect(screen.getByText("10000006")).toBeInTheDocument();
    expect(screen.getByText("Add layout")).toBeInTheDocument();
  });

  it("renders the status chip with the correct label", () => {
    renderWithProviders(
      <TaskCard task={makeTask({ status: "active" })} {...defaultProps} />,
      withTaskWritePermission,
    );
    expect(screen.getByText(/active/i)).toBeInTheDocument();
  });

  it("shows the assignee name when assigned", () => {
    mockedUseUserById.mockReturnValue({ id: "user-1", name: "Sweta" });
    renderWithProviders(
      <TaskCard task={makeTask({ assignee_id: "user-1" })} {...defaultProps} />,
      withTaskWritePermission,
    );
    expect(screen.getByText("Sweta")).toBeInTheDocument();
  });

  it("shows 'Unassigned' when there is no assignee", () => {
    mockedUseUserById.mockReturnValue(null);
    renderWithProviders(
      <TaskCard
        task={makeTask({ assignee_id: undefined })}
        {...defaultProps}
      />,
      withTaskWritePermission,
    );
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
  });

  it("renders the date range row when both start_date and end_date are set", () => {
    renderWithProviders(
      <TaskCard
        task={makeTask({ start_date: "2026-03-10", end_date: "2026-03-19" })}
        {...defaultProps}
      />,
      withTaskWritePermission,
    );
    expect(screen.getByText(/Mar 10/)).toBeInTheDocument();
    expect(screen.getByText(/Mar 19/)).toBeInTheDocument();
  });

  it("renders date row with dash placeholder when only start_date is set", () => {
    renderWithProviders(
      <TaskCard
        task={makeTask({ start_date: "2026-03-10", end_date: null })}
        {...defaultProps}
      />,
      withTaskWritePermission,
    );
    expect(screen.getByText(/Mar 10/)).toBeInTheDocument();
    expect(screen.getByText(/→/)).toBeInTheDocument();
  });

  it("does not render the date row when neither date is set", () => {
    renderWithProviders(
      <TaskCard
        task={makeTask({ start_date: undefined, end_date: undefined })}
        {...defaultProps}
      />,
      withTaskWritePermission,
    );
    expect(screen.queryByText(/→/)).not.toBeInTheDocument();
  });

  it("calls onClick when the task title is clicked", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    renderWithProviders(
      <TaskCard task={makeTask()} {...defaultProps} onClick={onClick} />,
      withTaskWritePermission,
    );
    await user.click(screen.getByText("Add layout"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

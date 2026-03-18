import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserStoryDialog from "@/components/sprint/UserStoryDialog";
import { renderWithProviders } from "../test-utils";
import type { Sprint } from "@/services/api/sprints";
import type { UserStory } from "@/services/api/userStories";

jest.mock("@/hooks/useUsers", () => ({
  useUsers: jest.fn(() => ({
    data: [
      { id: "u1", name: "Sweta" },
      { id: "u2", name: "Rajesh" },
    ],
  })),
  useUserById: jest.fn(() => null),
}));

const sprints: Sprint[] = [
  {
    id: "s1",
    name: "Sprint 1",
    project_id: "p1",
    status: "active",
    created_at: "",
  },
  {
    id: "s2",
    name: "Sprint 2",
    project_id: "p1",
    status: "planned",
    created_at: "",
  },
];

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn().mockResolvedValue(undefined),
  sprints,
  defaultSprintId: "s1",
};

beforeEach(() => jest.clearAllMocks());

describe("UserStoryDialog", () => {
  describe("Add mode", () => {
    it("shows 'Add User Story' heading", () => {
      renderWithProviders(<UserStoryDialog {...baseProps} />);
      // Text appears in both the DialogTitle and the submit button
      expect(screen.getAllByText("Add User Story").length).toBeGreaterThan(0);
    });

    it("shows validation errors on empty save", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserStoryDialog {...baseProps} />);
      await user.click(screen.getByRole("button", { name: /add user story/i }));
      expect(screen.getByText("Title is required")).toBeInTheDocument();
      expect(screen.getByText("Description is required")).toBeInTheDocument();
      expect(baseProps.onSave).not.toHaveBeenCalled();
    });

    it("calls onSave with correct payload when valid", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserStoryDialog {...baseProps} />);
      await user.type(screen.getByLabelText(/title/i), "New feature");
      await user.type(screen.getByLabelText(/description/i), "As a user...");
      await user.click(screen.getByRole("button", { name: /add user story/i }));
      await waitFor(() => expect(baseProps.onSave).toHaveBeenCalled());
      expect(baseProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New feature",
          description: "As a user...",
          sprint_id: "s1",
        }),
        undefined,
      );
    });

    it("calls onClose when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserStoryDialog {...baseProps} />);
      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Edit mode", () => {
    const editStory: UserStory = {
      id: "us1",
      title: "Login page",
      description: "Allow users to login",
      sprint_id: "s1",
      status: "active",
      created_at: "",
      assignee_id: "u1",
    };

    it("shows 'Edit User Story' in edit mode", () => {
      renderWithProviders(
        <UserStoryDialog {...baseProps} editStory={editStory} />,
      );
      expect(screen.getByText("Edit User Story")).toBeInTheDocument();
    });

    it("pre-populates title and description from editStory", () => {
      renderWithProviders(
        <UserStoryDialog {...baseProps} editStory={editStory} />,
      );
      expect((screen.getByLabelText(/title/i) as HTMLInputElement).value).toBe(
        "Login page",
      );
      expect(
        (screen.getByLabelText(/description/i) as HTMLInputElement).value,
      ).toBe("Allow users to login");
    });

    it("passes story id to onSave in edit mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <UserStoryDialog {...baseProps} editStory={editStory} />,
      );
      await user.click(
        screen.getByRole("button", { name: /update user story/i }),
      );
      expect(baseProps.onSave).toHaveBeenCalledWith(expect.any(Object), "us1");
    });
  });

  it("does not render when open=false", () => {
    renderWithProviders(<UserStoryDialog {...baseProps} open={false} />);
    expect(screen.queryByText("Add User Story")).not.toBeInTheDocument();
  });
});

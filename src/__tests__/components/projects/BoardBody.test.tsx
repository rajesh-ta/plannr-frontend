import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BoardBody from "@/components/projects/BoardBody";
import { renderWithProviders } from "../../test-utils";

// Mock child components to keep tests focused
jest.mock("@/components/projects/UserStoryRow", () => ({
  __esModule: true,
  default: ({ story }: { story: { title: string } }) => (
    <div data-testid="user-story-row">{story.title}</div>
  ),
}));

const baseProps = {
  userStories: [
    {
      id: "us1",
      title: "Story Alpha",
      sprint_id: "s1",
      status: "open",
      priority: "high",
      created_at: "",
      description: null,
      assigned_to: null,
    },
    {
      id: "us2",
      title: "Story Beta",
      sprint_id: "s1",
      status: "in_progress",
      priority: "medium",
      created_at: "",
      description: null,
      assigned_to: null,
    },
  ],
  loadingUserStories: false,
  selectedSprintId: "s1",
  storyTasks: {},
  loadingTasks: {},
  expandedStories: { us1: true, us2: true },
  allCollapsed: false,
  users: [],
  storyMenuAnchor: null,
  storyMenuId: null,
  onCollapseAll: jest.fn(),
  onToggleStory: jest.fn(),
  onTaskClick: jest.fn(),
  onAddTask: jest.fn(),
  onDeleteTask: jest.fn(),
  onStoryMenuOpen: jest.fn(),
  onStoryMenuClose: jest.fn(),
  onEditStory: jest.fn(),
  onDeleteStoryRequest: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("BoardBody", () => {
  it("renders the column headers", () => {
    renderWithProviders(<BoardBody {...baseProps} />);
    expect(screen.getByText("User Story")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders user story rows", () => {
    renderWithProviders(<BoardBody {...baseProps} />);
    expect(screen.getByText("Story Alpha")).toBeInTheDocument();
    expect(screen.getByText("Story Beta")).toBeInTheDocument();
  });

  it("shows 'Collapse all' text when allCollapsed=false", () => {
    renderWithProviders(<BoardBody {...baseProps} allCollapsed={false} />);
    expect(screen.getByText(/collapse all/i)).toBeInTheDocument();
  });

  it("shows 'Expand all' text when allCollapsed=true", () => {
    renderWithProviders(<BoardBody {...baseProps} allCollapsed={true} />);
    expect(screen.getByText(/expand all/i)).toBeInTheDocument();
  });

  it("calls onCollapseAll when collapse toggle is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BoardBody {...baseProps} />);
    await user.click(screen.getByText(/collapse all/i));
    expect(baseProps.onCollapseAll).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when no sprint is selected", () => {
    renderWithProviders(
      <BoardBody {...baseProps} selectedSprintId="" userStories={[]} />,
    );
    expect(
      screen.getByText(/select a project and sprint/i),
    ).toBeInTheDocument();
  });

  it("shows empty state when sprint has no stories", () => {
    renderWithProviders(<BoardBody {...baseProps} userStories={[]} />);
    expect(screen.getByText(/no user stories/i)).toBeInTheDocument();
  });
});

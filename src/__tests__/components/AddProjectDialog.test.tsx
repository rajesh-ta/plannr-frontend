import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddProjectDialog from "@/components/sprint/AddProjectDialog";
import { renderWithProviders, makeUser } from "../test-utils";
import { projectsApi } from "@/services/api/projects";

jest.mock("@/services/api/projects");
const mockedProjectsApi = projectsApi as jest.Mocked<typeof projectsApi>;

const withAuth = {
  preloadedState: {
    auth: { user: makeUser(), token: "tok", loading: false },
  },
};

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onCreated: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedProjectsApi.create.mockResolvedValue({
    id: "p1",
    name: "Plannr",
    description: "desc",
    created_at: "",
  });
});

describe("AddProjectDialog", () => {
  it("renders the dialog with title 'Add Project'", () => {
    renderWithProviders(<AddProjectDialog {...baseProps} />, withAuth);
    expect(screen.getByText("Add Project")).toBeInTheDocument();
  });

  it("shows validation errors when name is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProjectDialog {...baseProps} />, withAuth);
    await user.click(screen.getByRole("button", { name: /create project/i }));
    expect(screen.getByText("Project name is required")).toBeInTheDocument();
    expect(mockedProjectsApi.create).not.toHaveBeenCalled();
  });

  it("shows validation error when description is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProjectDialog {...baseProps} />, withAuth);
    await user.type(screen.getByLabelText(/project name/i), "My Project");
    await user.click(screen.getByRole("button", { name: /create project/i }));
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("calls projectsApi.create, onCreated and onClose with valid inputs", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProjectDialog {...baseProps} />, withAuth);
    await user.type(screen.getByLabelText(/project name/i), "My Project");
    await user.type(screen.getByLabelText(/description/i), "A great project");
    await user.click(screen.getByRole("button", { name: /create project/i }));
    await screen.findByText("Add Project");
    expect(mockedProjectsApi.create).toHaveBeenCalledWith({
      name: "My Project",
      description: "A great project",
    });
    expect(baseProps.onCreated).toHaveBeenCalledTimes(1);
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddProjectDialog {...baseProps} />, withAuth);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("does not render when open=false", () => {
    renderWithProviders(
      <AddProjectDialog {...baseProps} open={false} />,
      withAuth,
    );
    expect(screen.queryByText("Add Project")).not.toBeInTheDocument();
  });
});

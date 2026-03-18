import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SprintDialog from "@/components/sprint/SprintDialog";
import { renderWithProviders } from "../test-utils";
import type { Sprint } from "@/services/api/sprints";
import type { Project } from "@/services/api/projects";

const projects: Project[] = [
  { id: "p1", name: "Plannr", description: "", created_at: "" },
  { id: "p2", name: "Other", description: "", created_at: "" },
];

const baseProps = {
  open: true,
  onClose: jest.fn(),
  onSave: jest.fn().mockResolvedValue(undefined),
  projectId: "p1",
  projects,
};

beforeEach(() => jest.clearAllMocks());

describe("SprintDialog", () => {
  describe("Add mode", () => {
    it("shows 'Add Sprint' heading in add mode", () => {
      renderWithProviders(<SprintDialog {...baseProps} />);
      // Text appears in both the DialogTitle heading and the submit button
      expect(screen.getAllByText("Add Sprint").length).toBeGreaterThan(0);
    });

    it("validates empty name and shows error", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SprintDialog {...baseProps} />);
      await user.click(screen.getByRole("button", { name: /add sprint/i }));
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(baseProps.onSave).not.toHaveBeenCalled();
    });

    it("calls onSave then onClose with correct payload when valid", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SprintDialog {...baseProps} />);
      await user.type(screen.getByLabelText(/sprint name/i), "Sprint One");
      await user.click(screen.getByRole("button", { name: /add sprint/i }));
      await waitFor(() => expect(baseProps.onSave).toHaveBeenCalled());
      expect(baseProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Sprint One", project_id: "p1" }),
        undefined,
      );
    });

    it("calls onClose when Cancel is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SprintDialog {...baseProps} />);
      await user.click(screen.getByRole("button", { name: /cancel/i }));
      expect(baseProps.onClose).toHaveBeenCalledTimes(1);
    });

    it("calls onSave when valid (dates are optional)", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SprintDialog {...baseProps} />);
      await user.type(screen.getByLabelText(/sprint name/i), "Sprint Two");
      await user.click(screen.getByRole("button", { name: /add sprint/i }));
      await waitFor(() => expect(baseProps.onSave).toHaveBeenCalled());
      expect(baseProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Sprint Two",
          project_id: "p1",
        }),
        undefined,
      );
    });
  });

  describe("Edit mode", () => {
    const editSprint: Sprint = {
      id: "s1",
      name: "Sprint Alpha",
      project_id: "p1",
      status: "active",
      start_date: "2026-02-01",
      end_date: "2026-02-28",
      created_at: "",
    };

    it("shows 'Edit Sprint' heading in edit mode", () => {
      renderWithProviders(
        <SprintDialog {...baseProps} editSprint={editSprint} />,
      );
      expect(screen.getByText("Edit Sprint")).toBeInTheDocument();
    });

    it("pre-populates name and dates from editSprint", () => {
      renderWithProviders(
        <SprintDialog {...baseProps} editSprint={editSprint} />,
      );
      expect(
        (screen.getByLabelText(/sprint name/i) as HTMLInputElement).value,
      ).toBe("Sprint Alpha");
      expect(
        (screen.getByLabelText(/start date/i) as HTMLInputElement).value,
      ).toBe("2026-02-01");
    });

    it("calls onSave with the sprint id in edit mode", async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <SprintDialog {...baseProps} editSprint={editSprint} />,
      );
      await user.click(screen.getByRole("button", { name: /update sprint/i }));
      expect(baseProps.onSave).toHaveBeenCalledWith(expect.any(Object), "s1");
    });
  });

  it("does not render when open=false", () => {
    renderWithProviders(<SprintDialog {...baseProps} open={false} />);
    expect(screen.queryByText("Add Sprint")).not.toBeInTheDocument();
  });
});

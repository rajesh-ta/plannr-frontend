import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmDialog from "@/components/common/DeleteConfirmDialog";
import { renderWithProviders } from "../test-utils";

const defaultProps = {
  open: true,
  onClose: jest.fn(),
  onConfirm: jest.fn(),
  itemType: "Task",
  itemName: "Add layout",
};

beforeEach(() => jest.clearAllMocks());

describe("DeleteConfirmDialog", () => {
  it("renders the dialog with itemType in the title when open", () => {
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText("Delete Task")).toBeInTheDocument();
  });

  it("renders the itemName in the body text", () => {
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText(/Add layout/)).toBeInTheDocument();
  });

  it("renders without itemName gracefully", () => {
    renderWithProviders(
      <DeleteConfirmDialog {...defaultProps} itemName={undefined} />,
    );
    expect(screen.getByText("Delete Task")).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
  });

  it("does not render dialog content when open=false", () => {
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Delete Task")).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  it("calls both onConfirm and onClose when Delete is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<DeleteConfirmDialog {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});

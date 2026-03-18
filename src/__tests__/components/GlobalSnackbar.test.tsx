import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GlobalSnackbar from "@/components/common/GlobalSnackbar";
import { renderWithProviders } from "../test-utils";
import { showNotification } from "@/store/notificationSlice";

describe("GlobalSnackbar", () => {
  it("is not visible when notification is closed", () => {
    renderWithProviders(<GlobalSnackbar />);
    // No alert should be visible
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows the notification message when open", () => {
    const { store } = renderWithProviders(<GlobalSnackbar />, {
      preloadedState: {
        notification: {
          open: true,
          message: "Task saved!",
          severity: "success",
        },
      },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Task saved!")).toBeInTheDocument();
  });

  it("shows error severity alert", () => {
    renderWithProviders(<GlobalSnackbar />, {
      preloadedState: {
        notification: {
          open: true,
          message: "Something went wrong",
          severity: "error",
        },
      },
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("dispatches hideNotification when close button is clicked", async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<GlobalSnackbar />, {
      preloadedState: {
        notification: { open: true, message: "Close me", severity: "info" },
      },
    });
    // Click the close button on the Alert
    const closeButtons = screen.getAllByRole("button");
    await user.click(closeButtons[0]);
    expect(store.getState().notification.open).toBe(false);
  });
});

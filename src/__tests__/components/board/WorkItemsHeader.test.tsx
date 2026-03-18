import React from "react";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkItemsHeader from "@/components/board/WorkItemsHeader";
import { renderWithProviders } from "../../test-utils";

describe("WorkItemsHeader", () => {
  it("renders the Work Items heading", () => {
    renderWithProviders(<WorkItemsHeader />);
    expect(screen.getByText("Work Items")).toBeInTheDocument();
  });

  it("renders the 'Recently updated' sort button", () => {
    renderWithProviders(<WorkItemsHeader />);
    expect(screen.getByText("Recently updated")).toBeInTheDocument();
  });

  it("opens sort menu on button click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsHeader />);
    await user.click(screen.getByText("Recently updated"));
    expect(screen.getByText("Recently created")).toBeInTheDocument();
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
  });

  it("closes sort menu when a menu item is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsHeader />);
    await user.click(screen.getByText("Recently updated"));
    await user.click(screen.getAllByText("Recently updated")[1]);
    expect(screen.queryByText("Recently created")).not.toBeInTheDocument();
  });
});

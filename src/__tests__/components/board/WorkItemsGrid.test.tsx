import React from "react";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkItemsGrid from "@/components/board/WorkItemsGrid";
import { renderWithProviders } from "../../test-utils";

// ── Column headers ─────────────────────────────────────────────────────────────

describe("WorkItemsGrid — column headers", () => {
  it("renders the ID column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("ID")).toBeInTheDocument();
  });

  it("renders the Title column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("Title")).toBeInTheDocument();
  });

  it("renders the Assigned To column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("Assigned To")).toBeInTheDocument();
  });

  it("renders the State column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("State")).toBeInTheDocument();
  });

  it("renders the Area Path column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("Area Path")).toBeInTheDocument();
  });

  it("renders the Tags column header", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("Tags")).toBeInTheDocument();
  });
});

// ── Row data ───────────────────────────────────────────────────────────────────

describe("WorkItemsGrid — row data", () => {
  it("renders all mock work item rows (2 rows from mock data)", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(
      screen.getByText(/QA Testing: PI1 Iteration 2/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AISP Project Support_Iteration1/i),
    ).toBeInTheDocument();
  });

  it("renders the work item IDs", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("231065")).toBeInTheDocument();
    expect(screen.getByText("235402")).toBeInTheDocument();
  });

  it("renders assignee names", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("Kura, Swapna priya (PEP)")).toBeInTheDocument();
    expect(screen.getByText("Amir, Mohammad - Contractor")).toBeInTheDocument();
  });

  it("renders the state chip labels for each row", () => {
    renderWithProviders(<WorkItemsGrid />);
    // Both items have state "in-progress" → label "In Progress"
    const chips = screen.getAllByText("In Progress");
    expect(chips.length).toBe(2);
  });

  it("renders the area path for each row", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("EIAP_Projects\\Pepvigil")).toBeInTheDocument();
    expect(
      screen.getByText("EIAP_Projects\\EIP\\EIP Modern"),
    ).toBeInTheDocument();
  });

  it("renders a tag chip for items that have tags", () => {
    renderWithProviders(<WorkItemsGrid />);
    expect(screen.getByText("General Feature")).toBeInTheDocument();
  });

  it("renders avatar initials derived from the assignee name", () => {
    renderWithProviders(<WorkItemsGrid />);
    // "Kura, Swapna priya (PEP)" → first 2 chars upper-cased → "KU"
    expect(screen.getByText("KU")).toBeInTheDocument();
    // "Amir, Mohammad - Contractor" → "AM"
    expect(screen.getByText("AM")).toBeInTheDocument();
  });

  it("renders a MoreHoriz action button for every row", () => {
    renderWithProviders(<WorkItemsGrid />);
    // mui renders each IconButton; there should be one per row (2 rows)
    const moreButtons = screen
      .getAllByRole("button")
      .filter((b) => b.querySelector('[data-testid="MoreHorizIcon"]'));
    expect(moreButtons.length).toBe(2);
  });
});

// ── Row checkboxes ─────────────────────────────────────────────────────────────

describe("WorkItemsGrid — row checkboxes", () => {
  it("renders unchecked checkboxes for each row by default", () => {
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    // First checkbox is the "select all", rest are per-row
    const rowCheckboxes = checkboxes.slice(1);
    rowCheckboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });

  it("checks a row checkbox when clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    const firstRowCheckbox = checkboxes[1];
    await user.click(firstRowCheckbox);
    expect(firstRowCheckbox).toBeChecked();
  });

  it("unchecks a previously checked row checkbox when clicked again", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    const firstRowCheckbox = checkboxes[1];
    await user.click(firstRowCheckbox);
    expect(firstRowCheckbox).toBeChecked();
    await user.click(firstRowCheckbox);
    expect(firstRowCheckbox).not.toBeChecked();
  });

  it("checking both rows independently makes both checked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });
});

// ── Select-all checkbox ────────────────────────────────────────────────────────

describe("WorkItemsGrid — select-all checkbox", () => {
  it("renders an unchecked select-all checkbox by default", () => {
    renderWithProviders(<WorkItemsGrid />);
    const selectAll = screen.getAllByRole("checkbox")[0];
    expect(selectAll).not.toBeChecked();
  });

  it("select-all checks all row checkboxes", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[0]); // select all
    checkboxes.slice(1).forEach((cb) => expect(cb).toBeChecked());
  });

  it("select-all unchecks all when all rows are already checked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Select all, then deselect all
    await user.click(checkboxes[0]);
    await user.click(checkboxes[0]);
    checkboxes.slice(1).forEach((cb) => expect(cb).not.toBeChecked());
  });

  it("select-all becomes checked when all rows are individually selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);
    expect(checkboxes[0]).toBeChecked();
  });

  it("select-all is indeterminate when some (but not all) rows are checked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkItemsGrid />);
    const checkboxes = screen.getAllByRole("checkbox");
    await user.click(checkboxes[1]); // select only first row
    // MUI renders indeterminate state via the data-indeterminate attribute
    expect(checkboxes[0]).toHaveAttribute("data-indeterminate", "true");
  });
});

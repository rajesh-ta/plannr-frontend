import React from "react";
import { screen } from "@testing-library/react";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { render } from "@testing-library/react";

describe("ProjectContext / ProjectProvider", () => {
  it("renders children without crashing", () => {
    render(
      <ProjectProvider>
        <span>Context Child</span>
      </ProjectProvider>,
    );
    expect(screen.getByText("Context Child")).toBeInTheDocument();
  });

  it("renders multiple children", () => {
    render(
      <ProjectProvider>
        <span>First</span>
        <span>Second</span>
      </ProjectProvider>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });
});

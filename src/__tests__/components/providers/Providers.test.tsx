import React from "react";
import { screen } from "@testing-library/react";
import ReduxProvider from "@/components/providers/ReduxProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import { render } from "@testing-library/react";

describe("ReduxProvider", () => {
  it("renders children", () => {
    render(
      <ReduxProvider>
        <span>Hello Redux</span>
      </ReduxProvider>,
    );
    expect(screen.getByText("Hello Redux")).toBeInTheDocument();
  });
});

describe("QueryProvider", () => {
  it("renders children", () => {
    render(
      <QueryProvider>
        <span>Hello Query</span>
      </QueryProvider>,
    );
    expect(screen.getByText("Hello Query")).toBeInTheDocument();
  });
});

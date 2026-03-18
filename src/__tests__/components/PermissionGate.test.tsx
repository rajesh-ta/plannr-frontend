import React from "react";
import { screen } from "@testing-library/react";
import PermissionGate from "@/components/common/PermissionGate";
import { renderWithProviders, makeUser } from "../test-utils";

describe("PermissionGate", () => {
  it("renders children when the user has the required permission", () => {
    renderWithProviders(
      <PermissionGate action="task:write">
        <span>Protected content</span>
      </PermissionGate>,
      {
        preloadedState: {
          auth: {
            user: makeUser({ permissions: { "task:write": true } }),
            token: "tok",
            loading: false,
          },
        },
      },
    );
    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("does not render children when the user lacks the permission", () => {
    renderWithProviders(
      <PermissionGate action="task:write">
        <span>Protected content</span>
      </PermissionGate>,
      {
        preloadedState: {
          auth: {
            user: makeUser({ permissions: {} }),
            token: "tok",
            loading: false,
          },
        },
      },
    );
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders the fallback when the user lacks the permission", () => {
    renderWithProviders(
      <PermissionGate action="admin:write" fallback={<span>No access</span>}>
        <span>Admin panel</span>
      </PermissionGate>,
      {
        preloadedState: {
          auth: {
            user: makeUser({ permissions: { "task:read": true } }),
            token: "tok",
            loading: false,
          },
        },
      },
    );
    expect(screen.queryByText("Admin panel")).not.toBeInTheDocument();
    expect(screen.getByText("No access")).toBeInTheDocument();
  });

  it("renders nothing (null fallback) by default when permission is missing", () => {
    const { container } = renderWithProviders(
      <PermissionGate action="sprint:write">
        <span>Sprint action</span>
      </PermissionGate>,
      {
        preloadedState: {
          auth: { user: null, token: null, loading: false },
        },
      },
    );
    expect(screen.queryByText("Sprint action")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });
});

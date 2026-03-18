import { renderHook, act } from "@testing-library/react";
import React from "react";
import { Provider } from "react-redux";
import { useProject } from "@/hooks/useProject";
import { makeStore } from "../test-utils";

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useProject", () => {
  it("returns empty strings as initial selectedProjectId and selectedSprintId", () => {
    const store = makeStore();
    const { result } = renderHook(() => useProject(), {
      wrapper: wrapper(store),
    });
    expect(result.current.selectedProjectId).toBe("");
    expect(result.current.selectedSprintId).toBe("");
  });

  it("setSelectedProjectId dispatches to redux and updates the hook value", () => {
    const store = makeStore();
    const { result } = renderHook(() => useProject(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.setSelectedProjectId("proj-99"));
    expect(result.current.selectedProjectId).toBe("proj-99");
    expect(store.getState().project.selectedProjectId).toBe("proj-99");
  });

  it("setSelectedSprintId dispatches to redux and updates the hook value", () => {
    const store = makeStore();
    const { result } = renderHook(() => useProject(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.setSelectedSprintId("sprint-42"));
    expect(result.current.selectedSprintId).toBe("sprint-42");
    expect(store.getState().project.selectedSprintId).toBe("sprint-42");
  });

  it("updating projectId does not affect sprintId", () => {
    const store = makeStore();
    const { result } = renderHook(() => useProject(), {
      wrapper: wrapper(store),
    });
    act(() => result.current.setSelectedSprintId("sprint-1"));
    act(() => result.current.setSelectedProjectId("proj-2"));
    expect(result.current.selectedSprintId).toBe("sprint-1");
    expect(result.current.selectedProjectId).toBe("proj-2");
  });
});

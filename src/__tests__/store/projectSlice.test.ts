import projectReducer, {
  ProjectState,
  setSelectedProjectId,
  setSelectedSprintId,
} from "@/store/projectSlice";

const initialState: ProjectState = {
  selectedProjectId: "",
  selectedSprintId: "",
};

describe("projectSlice", () => {
  it("returns the correct initial state", () => {
    const state = projectReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual({ selectedProjectId: "", selectedSprintId: "" });
  });

  it("setSelectedProjectId updates selectedProjectId", () => {
    const state = projectReducer(initialState, setSelectedProjectId("proj-1"));
    expect(state.selectedProjectId).toBe("proj-1");
    expect(state.selectedSprintId).toBe("");
  });

  it("setSelectedSprintId updates selectedSprintId", () => {
    const state = projectReducer(initialState, setSelectedSprintId("sprint-1"));
    expect(state.selectedSprintId).toBe("sprint-1");
    expect(state.selectedProjectId).toBe("");
  });

  it("setSelectedProjectId does not affect selectedSprintId", () => {
    const withSprint: ProjectState = {
      selectedProjectId: "",
      selectedSprintId: "sprint-42",
    };
    const state = projectReducer(withSprint, setSelectedProjectId("proj-99"));
    expect(state.selectedSprintId).toBe("sprint-42");
  });
});

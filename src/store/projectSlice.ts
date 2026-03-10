import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProjectState {
  selectedProjectId: string;
  selectedSprintId: string;
}

const initialState: ProjectState = {
  selectedProjectId: "",
  selectedSprintId: "",
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setSelectedProjectId(state, action: PayloadAction<string>) {
      state.selectedProjectId = action.payload;
    },
    setSelectedSprintId(state, action: PayloadAction<string>) {
      state.selectedSprintId = action.payload;
    },
  },
});

export const { setSelectedProjectId, setSelectedSprintId } =
  projectSlice.actions;
export default projectSlice.reducer;

export interface StatusStyle {
  bg: string;
  color: string;
  label: string;
}

export const TASK_STATUS_STYLES: Record<string, StatusStyle> = {
  new: {
    bg: "#E1DFDD",
    color: "#323130",
    label: "New",
  },
  active: {
    bg: "#C7E0F4",
    color: "#0078D4",
    label: "Active",
  },
  closed: {
    bg: "#DFF6DD",
    color: "#107C10",
    label: "Closed",
  },
  removed: {
    bg: "#FAD2CF",
    color: "#A80000",
    label: "Removed",
  },
};

export const USER_STORY_STATUS_STYLES: Record<string, StatusStyle> = {
  new: {
    bg: "#E1DFDD",
    color: "#323130",
    label: "New",
  },
  active: {
    bg: "#C7E0F4",
    color: "#0078D4",
    label: "Active",
  },
  closed: {
    bg: "#DFF6DD",
    color: "#107C10",
    label: "Closed",
  },
  removed: {
    bg: "#FAD2CF",
    color: "#A80000",
    label: "Removed",
  },
};

/** Fallback for unknown statuses */
export const DEFAULT_STATUS_STYLE: StatusStyle = {
  bg: "#F3F2F1",
  color: "#605E5C",
  label: "",
};

export const getTaskStatusStyle = (status: string): StatusStyle =>
  TASK_STATUS_STYLES[status?.toLowerCase()] ?? DEFAULT_STATUS_STYLE;

export const getUserStoryStatusStyle = (status: string): StatusStyle =>
  USER_STORY_STATUS_STYLES[status?.toLowerCase()] ?? DEFAULT_STATUS_STYLE;

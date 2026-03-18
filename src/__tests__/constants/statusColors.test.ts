import {
  getTaskStatusStyle,
  getUserStoryStatusStyle,
  TASK_STATUS_STYLES,
  USER_STORY_STATUS_STYLES,
  DEFAULT_STATUS_STYLE,
} from "@/constants/statusColors";

describe("getTaskStatusStyle", () => {
  it.each(["new", "active", "closed", "removed"])(
    "returns the correct style for status '%s'",
    (status) => {
      const style = getTaskStatusStyle(status);
      expect(style).toEqual(TASK_STATUS_STYLES[status]);
      expect(style.label).toBeTruthy();
      expect(style.bg).toBeTruthy();
      expect(style.color).toBeTruthy();
    },
  );

  it("returns the default style for an unknown status", () => {
    expect(getTaskStatusStyle("unknown")).toEqual(DEFAULT_STATUS_STYLE);
  });

  it("is case-insensitive — uppercased status returns correct style", () => {
    expect(getTaskStatusStyle("NEW")).toEqual(TASK_STATUS_STYLES["new"]);
    expect(getTaskStatusStyle("ACTIVE")).toEqual(TASK_STATUS_STYLES["active"]);
    expect(getTaskStatusStyle("CLOSED")).toEqual(TASK_STATUS_STYLES["closed"]);
    expect(getTaskStatusStyle("REMOVED")).toEqual(
      TASK_STATUS_STYLES["removed"],
    );
  });

  it("handles null/undefined gracefully via default style", () => {
    expect(getTaskStatusStyle(undefined as unknown as string)).toEqual(
      DEFAULT_STATUS_STYLE,
    );
  });

  it("returns label 'New' for new status", () => {
    expect(getTaskStatusStyle("new").label).toBe("New");
  });
  it("returns label 'Active' for active status", () => {
    expect(getTaskStatusStyle("active").label).toBe("Active");
  });
  it("returns label 'Closed' for closed status", () => {
    expect(getTaskStatusStyle("closed").label).toBe("Closed");
  });
  it("returns label 'Removed' for removed status", () => {
    expect(getTaskStatusStyle("removed").label).toBe("Removed");
  });
});

describe("getUserStoryStatusStyle", () => {
  it.each(["new", "active", "closed", "removed"])(
    "returns the correct style for status '%s'",
    (status) => {
      expect(getUserStoryStatusStyle(status)).toEqual(
        USER_STORY_STATUS_STYLES[status],
      );
    },
  );

  it("returns default style for unknown status", () => {
    expect(getUserStoryStatusStyle("pending")).toEqual(DEFAULT_STATUS_STYLE);
  });

  it("is case-insensitive", () => {
    expect(getUserStoryStatusStyle("CLOSED")).toEqual(
      USER_STORY_STATUS_STYLES["closed"],
    );
  });
});

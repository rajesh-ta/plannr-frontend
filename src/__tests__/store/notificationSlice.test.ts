import notificationReducer, {
  NotificationState,
  showNotification,
  hideNotification,
} from "@/store/notificationSlice";

const initialState: NotificationState = {
  open: false,
  message: "",
  severity: "error",
};

describe("notificationSlice", () => {
  it("returns the correct initial state", () => {
    expect(notificationReducer(undefined, { type: "@@INIT" })).toEqual(
      initialState,
    );
  });

  it("showNotification sets open=true and applies message and default severity", () => {
    const state = notificationReducer(
      initialState,
      showNotification({ message: "Something went wrong" }),
    );
    expect(state.open).toBe(true);
    expect(state.message).toBe("Something went wrong");
    expect(state.severity).toBe("error");
  });

  it("showNotification respects an explicitly provided severity", () => {
    const state = notificationReducer(
      initialState,
      showNotification({ message: "Done!", severity: "success" }),
    );
    expect(state.severity).toBe("success");
    expect(state.open).toBe(true);
  });

  it("showNotification works for all severity levels", () => {
    for (const severity of ["error", "warning", "info", "success"] as const) {
      const state = notificationReducer(
        initialState,
        showNotification({ message: "msg", severity }),
      );
      expect(state.severity).toBe(severity);
    }
  });

  it("hideNotification sets open=false without changing message", () => {
    const open: NotificationState = {
      open: true,
      message: "A message",
      severity: "info",
    };
    const state = notificationReducer(open, hideNotification());
    expect(state.open).toBe(false);
    expect(state.message).toBe("A message");
  });
});

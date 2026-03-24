/**
 * Unit tests for src/services/api/client.ts
 *
 * Coverage:
 *  - axios.create is called (module initialisation)
 *  - Request interceptor: attaches / omits Bearer token based on cookie
 *  - Response interceptor (fulfilled): passes responses through unchanged
 *  - Response interceptor (rejected):
 *      401 → redirect to /login (unless already on auth page)
 *      403 → warning notification
 *      422 → warning notification (array detail joined, string detail, skipped on auth routes)
 *      5xx → server error notification
 *      network/timeout → network error notification
 *      other → show server message (skipped on auth routes)
 */

import Cookies from "js-cookie";
import { showNotification } from "@/store/notificationSlice";
import { store } from "@/store/store";

/* -------------------------------------------------------------------------- */
/* Capture interceptor handlers via hoisted jest.mock factories               */
/* `var` is required here so the declarations are available in the hoisted    */
/* mock factory scope (const/let are in the TDZ at mock hoisting time).       */
/* -------------------------------------------------------------------------- */

// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
var capturedRequestFulfilled: ((config: any) => any) | undefined;
// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
var capturedResponseFulfilled: ((response: any) => any) | undefined;
// eslint-disable-next-line no-var, @typescript-eslint/no-explicit-any
var capturedResponseRejected: ((error: any) => Promise<never>) | undefined;

jest.mock("axios", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: jest.fn(() => ({
    interceptors: {
      request: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        use: jest.fn((fulfilled: any) => {
          capturedRequestFulfilled = fulfilled;
          return 0;
        }),
      },
      response: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        use: jest.fn((fulfilled: any, rejected: any) => {
          capturedResponseFulfilled = fulfilled;
          capturedResponseRejected = rejected;
          return 0;
        }),
      },
    },
  })),
}));

jest.mock("js-cookie", () => ({ get: jest.fn() }));

jest.mock("@/store/store", () => ({
  store: { dispatch: jest.fn() },
}));

jest.mock("@/store/notificationSlice", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showNotification: jest.fn((payload: any) => ({
    type: "notification/showNotification",
    payload,
  })),
}));

// Import AFTER mock registrations so the module loads with mocked deps
import { apiClient } from "@/services/api/client";

// Typed references to mock functions
const mockGet = Cookies.get as jest.MockedFunction<typeof Cookies.get>;
const mockDispatch = store.dispatch as jest.MockedFunction<
  typeof store.dispatch
>;
const mockShowNotification = showNotification as jest.MockedFunction<
  typeof showNotification
>;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Navigate jsdom to `path` via pushState so window.location.pathname reflects
 * the desired route without triggering a full page load.
 */
function navigateTo(path: string) {
  window.history.pushState({}, "", path);
}

/** Build a minimal mock axios error object. */
function makeError(opts: {
  status?: number;
  data?: Record<string, unknown>;
  message?: string;
  url?: string;
  noResponse?: boolean;
}) {
  return {
    response: opts.noResponse
      ? undefined
      : {
          status: opts.status ?? 500,
          data: opts.data ?? {},
        },
    message: opts.message ?? "Generic error",
    config: { url: opts.url ?? "/projects" },
  };
}

/* -------------------------------------------------------------------------- */
/* Global setup                                                                */
/* -------------------------------------------------------------------------- */

beforeEach(() => {
  jest.clearAllMocks();
  // Reset pathname to a non-auth route before every test.
  navigateTo("/dashboard");
});

/* ========================================================================== */
/* apiClient — module initialisation                                           */
/* ========================================================================== */

describe("apiClient", () => {
  it("is defined after module load", () => {
    expect(apiClient).toBeDefined();
  });

  it("registers a request interceptor handler", () => {
    expect(capturedRequestFulfilled).toBeInstanceOf(Function);
  });

  it("registers response interceptor fulfilled and rejected handlers", () => {
    expect(capturedResponseFulfilled).toBeInstanceOf(Function);
    expect(capturedResponseRejected).toBeInstanceOf(Function);
  });
});

/* ========================================================================== */
/* Request interceptor                                                         */
/* ========================================================================== */

describe("Request interceptor", () => {
  it("adds Authorization: Bearer <token> when cookie is present", () => {
    mockGet.mockReturnValue("my-jwt-token");
    const config = { headers: {} as Record<string, string> };

    const result = capturedRequestFulfilled!(config);

    expect(mockGet).toHaveBeenCalledWith("plannr_token");
    expect(result.headers["Authorization"]).toBe("Bearer my-jwt-token");
  });

  it("does not set Authorization header when cookie is absent", () => {
    mockGet.mockReturnValue(undefined as unknown as string);
    const config = { headers: {} as Record<string, string> };

    const result = capturedRequestFulfilled!(config);

    expect(result.headers["Authorization"]).toBeUndefined();
  });

  it("returns the original config object (pass-through)", () => {
    mockGet.mockReturnValue(undefined as unknown as string);
    const config = { headers: { "Content-Type": "application/json" } };

    expect(capturedRequestFulfilled!(config)).toBe(config);
  });

  it("preserves existing headers alongside the new Authorization header", () => {
    mockGet.mockReturnValue("tok");
    const config = {
      headers: { "Content-Type": "application/json" } as Record<string, string>,
    };

    const result = capturedRequestFulfilled!(config);

    expect(result.headers["Content-Type"]).toBe("application/json");
    expect(result.headers["Authorization"]).toBe("Bearer tok");
  });
});

/* ========================================================================== */
/* Response interceptor — success path                                         */
/* ========================================================================== */

describe("Response interceptor — success", () => {
  it("returns the response object unchanged for 2xx replies", () => {
    const response = { status: 200, data: { id: "1", name: "Test" } };

    expect(capturedResponseFulfilled!(response)).toBe(response);
  });

  it("does not dispatch any notifications for successful responses", () => {
    capturedResponseFulfilled!({ status: 201, data: {} });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

/* ========================================================================== */
/* Response interceptor — 401 Unauthorized                                     */
/* ========================================================================== */

describe("Response interceptor — 401", () => {
  it("attempts to navigate to /login when not on an auth page", async () => {
    // jsdom does not implement full navigation, but it calls console.error with
    // "Not implemented: navigation (except hash changes)" when href is assigned.
    // We can spy on that error to verify the redirect code ran.
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const error = makeError({ status: 401, url: "/projects" });
    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    // The interceptor set window.location.href → jsdom fires the navigation error
    expect(consoleErrorSpy).toHaveBeenCalled();
    // Use duck-typing: jsdom's Error comes from a different realm, so
    // `instanceof Error` may fail cross-realm — check message directly instead.
    const firstArg = consoleErrorSpy.mock.calls[0][0] as { message?: string };
    const errorText = firstArg?.message ?? String(firstArg);
    expect(errorText).toMatch(/navigation/i);

    // Early return means dispatch is never called
    expect(mockDispatch).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("does NOT navigate away when already on the /login page", async () => {
    navigateTo("/login"); // pathname is now /login → redirect skipped
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const error = makeError({ status: 401, url: "/auth/login" });
    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    // No navigation was attempted — jsdom should NOT have logged the nav error
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("does NOT navigate away when already on the /signup page", async () => {
    navigateTo("/signup"); // pathname starts with /signup → redirect skipped
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const error = makeError({ status: 401, url: "/auth/register" });
    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it("does NOT dispatch a notification when the redirect fires on 401", async () => {
    // Suppress jsdom's navigation console noise
    jest.spyOn(console, "error").mockImplementation(() => {});

    // /dashboard (beforeEach default) → redirect fires and returns early
    const error = makeError({ status: 401, url: "/users/me" });
    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});

/* ========================================================================== */
/* Response interceptor — 403 Forbidden                                        */
/* ========================================================================== */

describe("Response interceptor — 403", () => {
  it("dispatches a warning notification and rejects the promise", async () => {
    const error = makeError({ status: 403, url: "/admin/users" });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "You don't have permission to do that.",
      severity: "warning",
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

/* ========================================================================== */
/* Response interceptor — 422 Unprocessable Entity                            */
/* ========================================================================== */

describe("Response interceptor — 422", () => {
  it("dispatches warning with detail string on non-auth routes", async () => {
    const error = makeError({
      status: 422,
      data: { detail: "Value out of range" },
      url: "/sprints",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Value out of range",
      severity: "warning",
    });
  });

  it("joins array detail msgs with ', ' on non-auth routes", async () => {
    const error = makeError({
      status: 422,
      data: { detail: [{ msg: "Field required" }, { msg: "Invalid email" }] },
      url: "/tasks",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Field required, Invalid email",
      severity: "warning",
    });
  });

  it("does NOT dispatch a notification for /auth/register", async () => {
    const error = makeError({
      status: 422,
      data: { detail: "Email already taken" },
      url: "/auth/register",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("does NOT dispatch a notification for /auth/login", async () => {
    const error = makeError({
      status: 422,
      data: { detail: "Wrong password" },
      url: "/auth/login",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("still rejects the promise even when notification is skipped (auth route)", async () => {
    const error = makeError({
      status: 422,
      data: { detail: "Validation failed" },
      url: "/auth/register",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);
  });
});

/* ========================================================================== */
/* Response interceptor — 5xx Server Errors                                   */
/* ========================================================================== */

describe("Response interceptor — 5xx", () => {
  it("dispatches a server error notification for status 500", async () => {
    const error = makeError({ status: 500, url: "/projects" });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "A server error occurred. Please try again later.",
      severity: "error",
    });
  });

  it("dispatches a server error notification for status 502", async () => {
    const error = makeError({ status: 502, url: "/sprints" });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "A server error occurred. Please try again later.",
      severity: "error",
    });
  });

  it("dispatches a server error notification for status 503", async () => {
    const error = makeError({ status: 503, url: "/tasks" });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "A server error occurred. Please try again later.",
      severity: "error",
    });
  });
});

/* ========================================================================== */
/* Response interceptor — Network / timeout errors (no response object)       */
/* ========================================================================== */

describe("Response interceptor — network errors", () => {
  it("dispatches a network error notification when error.response is absent", async () => {
    const error = makeError({ noResponse: true, url: "/tasks" });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Network error — please check your connection.",
      severity: "error",
    });
  });

  it("dispatches exactly one notification for a network error", async () => {
    const error = makeError({ noResponse: true });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

/* ========================================================================== */
/* Response interceptor — all other errors (e.g. 400, 404)                   */
/* ========================================================================== */

describe("Response interceptor — other errors", () => {
  it("shows the server detail message for non-auth routes (404)", async () => {
    const error = makeError({
      status: 404,
      data: { detail: "Resource not found" },
      url: "/projects/unknown",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Resource not found",
      severity: "error",
    });
  });

  it("falls back to error.message when response.data.detail is absent", async () => {
    const error = makeError({
      status: 400,
      data: {},
      message: "Bad Request",
      url: "/projects",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Bad Request",
      severity: "error",
    });
  });

  it("falls back to 'Something went wrong' when both detail and message are absent", async () => {
    const error = {
      response: { status: 400, data: {} },
      message: undefined,
      config: { url: "/projects" },
    };

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Something went wrong",
      severity: "error",
    });
  });

  it("uses response.data.message as fallback when detail is absent", async () => {
    const error = makeError({
      status: 400,
      data: { message: "Custom server message" },
      url: "/user-stories",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockShowNotification).toHaveBeenCalledWith({
      message: "Custom server message",
      severity: "error",
    });
  });

  it("does NOT dispatch a notification for other errors on /auth/login", async () => {
    const error = makeError({
      status: 400,
      data: { detail: "Some error" },
      url: "/auth/login",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("does NOT dispatch a notification for other errors on /auth/register", async () => {
    const error = makeError({
      status: 400,
      data: { detail: "Some error" },
      url: "/auth/register",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("dispatches exactly one notification for non-auth other errors", async () => {
    const error = makeError({
      status: 404,
      data: { detail: "Not found" },
      url: "/projects",
    });

    await expect(capturedResponseRejected!(error)).rejects.toBe(error);

    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

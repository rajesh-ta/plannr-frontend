import authReducer, {
  AuthState,
  setCredentials,
  setToken,
  setLoading,
  clearCredentials,
} from "@/store/authSlice";
import { makeUser } from "../test-utils";

const initialState: AuthState = { user: null, token: null, loading: true };

describe("authSlice", () => {
  it("returns the correct initial state", () => {
    const state = authReducer(undefined, { type: "@@INIT" });
    expect(state).toEqual({ user: null, token: null, loading: true });
  });

  it("setCredentials stores user and token and sets loading to false", () => {
    const user = makeUser();
    const state = authReducer(
      initialState,
      setCredentials({ user, token: "tok-123" }),
    );
    expect(state.user).toEqual(user);
    expect(state.token).toBe("tok-123");
    expect(state.loading).toBe(false);
  });

  it("clearCredentials resets user and token to null", () => {
    const populated: AuthState = {
      user: makeUser(),
      token: "tok-abc",
      loading: false,
    };
    const state = authReducer(populated, clearCredentials());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.loading).toBe(false);
  });

  it("setToken updates only the token", () => {
    const state = authReducer(initialState, setToken("new-token"));
    expect(state.token).toBe("new-token");
    expect(state.user).toBeNull();
  });

  it("setLoading toggles the loading flag", () => {
    const state1 = authReducer(initialState, setLoading(false));
    expect(state1.loading).toBe(false);

    const state2 = authReducer(state1, setLoading(true));
    expect(state2.loading).toBe(true);
  });
});

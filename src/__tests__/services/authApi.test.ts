import { authApi } from "@/services/api/auth";
import { apiClient } from "@/services/api/client";

jest.mock("@/services/api/client", () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

const mc = apiClient as jest.Mocked<typeof apiClient>;

const mockUser = {
  id: "u1",
  name: "Test",
  email: "t@t.com",
  role_id: null,
  role_name: null,
  status: "ACTIVE",
  last_modified_on: null,
  last_modified_by: null,
  avatar_url: null,
  auth_provider: "email",
  created_at: "2026-01-01T00:00:00Z",
  permissions: {},
};
const mockAuthResp = {
  access_token: "tok",
  token_type: "bearer",
  user: mockUser,
};

beforeEach(() => jest.clearAllMocks());

describe("authApi", () => {
  it("register posts to /auth/register and returns AuthResponse", async () => {
    mc.post.mockResolvedValueOnce({ data: mockAuthResp });
    const res = await authApi.register({
      name: "T",
      email: "t@t.com",
      password: "pw",
    });
    expect(mc.post).toHaveBeenCalledWith("/auth/register", {
      name: "T",
      email: "t@t.com",
      password: "pw",
      role_id: undefined,
    });
    expect(res.access_token).toBe("tok");
  });

  it("login posts to /auth/login with email and password", async () => {
    mc.post.mockResolvedValueOnce({ data: mockAuthResp });
    const res = await authApi.login("a@b.com", "secret");
    expect(mc.post).toHaveBeenCalledWith("/auth/login", {
      email: "a@b.com",
      password: "secret",
    });
    expect(res.user).toEqual(mockUser);
  });

  it("googleAuth posts credential to /auth/google", async () => {
    mc.post.mockResolvedValueOnce({ data: mockAuthResp });
    await authApi.googleAuth("google-cred-123");
    expect(mc.post).toHaveBeenCalledWith("/auth/google", {
      credential: "google-cred-123",
    });
  });

  it("me calls GET /auth/me and returns UserOut", async () => {
    mc.get.mockResolvedValueOnce({ data: mockUser });
    const res = await authApi.me();
    expect(mc.get).toHaveBeenCalledWith("/auth/me");
    expect(res).toEqual(mockUser);
  });
});

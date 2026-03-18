import { projectsApi } from "@/services/api/projects";
import { sprintsApi } from "@/services/api/sprints";
import { userStoriesApi } from "@/services/api/userStories";
import { usersApi } from "@/services/api/users";
import { rolesApi } from "@/services/api/roles";
import { apiClient } from "@/services/api/client";
import axios from "axios";

jest.mock("@/services/api/client", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));
jest.mock("axios");

const mc = apiClient as jest.Mocked<typeof apiClient>;
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => jest.clearAllMocks());

// ─── projectsApi ────────────────────────────────────────────────────────────
describe("projectsApi", () => {
  const project = {
    id: "p1",
    name: "Plannr",
    description: "desc",
    created_at: "2026-01-01",
  };

  it("getAll calls GET /projects", async () => {
    mc.get.mockResolvedValueOnce({ data: [project] });
    const res = await projectsApi.getAll();
    expect(mc.get).toHaveBeenCalledWith("/projects");
    expect(res).toEqual([project]);
  });

  it("create posts to /projects and returns new project", async () => {
    mc.post.mockResolvedValueOnce({ data: project });
    const res = await projectsApi.create({
      name: "Plannr",
      description: "desc",
    });
    expect(mc.post).toHaveBeenCalledWith("/projects", {
      name: "Plannr",
      description: "desc",
    });
    expect(res).toEqual(project);
  });
});

// ─── sprintsApi ─────────────────────────────────────────────────────────────
describe("sprintsApi", () => {
  const sprint = {
    id: "s1",
    name: "Sprint 1",
    project_id: "p1",
    status: "active",
    created_at: "2026-01-01",
  };

  it("getByProjectId calls GET /sprints/project/:id", async () => {
    mc.get.mockResolvedValueOnce({ data: [sprint] });
    const res = await sprintsApi.getByProjectId("p1");
    expect(mc.get).toHaveBeenCalledWith("/sprints/project/p1");
    expect(res).toEqual([sprint]);
  });

  it("create posts to /sprints/ with payload", async () => {
    mc.post.mockResolvedValueOnce({ data: sprint });
    const payload = { name: "Sprint 1", project_id: "p1", status: "planned" };
    const res = await sprintsApi.create(payload);
    expect(mc.post).toHaveBeenCalledWith("/sprints/", payload);
    expect(res).toEqual(sprint);
  });
});

// ─── userStoriesApi ──────────────────────────────────────────────────────────
describe("userStoriesApi", () => {
  const story = {
    id: "us1",
    title: "Login page",
    sprint_id: "s1",
    status: "new",
    created_at: "2026-01-01",
  };

  it("getBySprintId calls GET /user-stories/sprint/:id", async () => {
    mc.get.mockResolvedValueOnce({ data: [story] });
    const res = await userStoriesApi.getBySprintId("s1");
    expect(mc.get).toHaveBeenCalledWith("/user-stories/sprint/s1");
    expect(res).toEqual([story]);
  });

  it("create posts to /user-stories/", async () => {
    mc.post.mockResolvedValueOnce({ data: story });
    const payload = { sprint_id: "s1", title: "Login page", status: "new" };
    const res = await userStoriesApi.create(payload);
    expect(mc.post).toHaveBeenCalledWith("/user-stories/", payload);
    expect(res).toEqual(story);
  });

  it("update puts to /user-stories/:id", async () => {
    mc.put.mockResolvedValueOnce({ data: { ...story, status: "active" } });
    const res = await userStoriesApi.update("us1", { status: "active" });
    expect(mc.put).toHaveBeenCalledWith("/user-stories/us1", {
      status: "active",
    });
    expect(res.status).toBe("active");
  });

  it("delete calls DELETE /user-stories/:id", async () => {
    mc.delete.mockResolvedValueOnce({});
    await userStoriesApi.delete("us1");
    expect(mc.delete).toHaveBeenCalledWith("/user-stories/us1");
  });
});

// ─── usersApi ───────────────────────────────────────────────────────────────
describe("usersApi", () => {
  const user = {
    id: "u1",
    name: "Sweta",
    email: "s@s.com",
    role_id: "r1",
    role_name: "DEV",
    status: "ACTIVE",
    last_modified_on: null,
    last_modified_by: null,
    avatar_url: null,
    auth_provider: "email",
    created_at: "2026-01-01",
  };

  it("getAll calls GET /users/", async () => {
    mc.get.mockResolvedValueOnce({ data: [user] });
    const res = await usersApi.getAll();
    expect(mc.get).toHaveBeenCalledWith("/users/");
    expect(res).toEqual([user]);
  });

  it("getById calls GET /users/:id", async () => {
    mc.get.mockResolvedValueOnce({ data: user });
    const res = await usersApi.getById("u1");
    expect(mc.get).toHaveBeenCalledWith("/users/u1");
    expect(res).toEqual(user);
  });

  it("update puts to /users/:id with data", async () => {
    mc.put.mockResolvedValueOnce({ data: { ...user, role_id: "r2" } });
    const res = await usersApi.update("u1", { role_id: "r2" });
    expect(mc.put).toHaveBeenCalledWith("/users/u1", { role_id: "r2" });
    expect(res.role_id).toBe("r2");
  });

  it("delete calls DELETE /users/:id", async () => {
    mc.delete.mockResolvedValueOnce({});
    await usersApi.delete("u1");
    expect(mc.delete).toHaveBeenCalledWith("/users/u1");
  });
});

// ─── rolesApi ───────────────────────────────────────────────────────────────
describe("rolesApi", () => {
  const role = {
    id: "r1",
    role_name: "PROJECT_ADMIN",
    description: "Admin",
    is_active: true,
    created_at: "2026-01-01",
    modified_at: "2026-01-01",
  };

  it("getAll uses plain axios (not apiClient) to GET /roles/", async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: [role] });
    const res = await rolesApi.getAll();
    expect(mockedAxios.get).toHaveBeenCalled();
    expect(mc.get).not.toHaveBeenCalled();
    expect(res).toEqual([role]);
  });

  it("getById calls GET /roles/:id via apiClient", async () => {
    mc.get.mockResolvedValueOnce({ data: role });
    const res = await rolesApi.getById("r1");
    expect(mc.get).toHaveBeenCalledWith("/roles/r1");
    expect(res).toEqual(role);
  });
});

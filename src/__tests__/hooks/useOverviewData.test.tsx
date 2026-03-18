import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { tasksApi } from "@/services/api/tasks";
import { usersApi } from "@/services/api/users";
import { useOverviewData } from "@/hooks/useOverviewData";

jest.mock("@/services/api/tasks");
jest.mock("@/services/api/users");

const mockedTasksApi = tasksApi as jest.Mocked<typeof tasksApi>;
const mockedUsersApi = usersApi as jest.Mocked<typeof usersApi>;

function wrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

const USERS = [
  {
    id: "u1",
    name: "Sweta",
    email: "",
    role_id: null,
    role_name: null,
    status: "ACTIVE",
    last_modified_on: null,
    last_modified_by: null,
    avatar_url: null,
    auth_provider: "email",
    created_at: "",
  },
  {
    id: "u2",
    name: "Rajesh",
    email: "",
    role_id: null,
    role_name: null,
    status: "ACTIVE",
    last_modified_on: null,
    last_modified_by: null,
    avatar_url: null,
    auth_provider: "email",
    created_at: "",
  },
];

const TASKS = [
  {
    id: "t1",
    task_no: "1",
    title: "T1",
    user_story_id: "s1",
    status: "new",
    created_at: "",
    assignee_id: "u1",
  },
  {
    id: "t2",
    task_no: "2",
    title: "T2",
    user_story_id: "s1",
    status: "active",
    created_at: "",
    assignee_id: "u1",
  },
  {
    id: "t3",
    task_no: "3",
    title: "T3",
    user_story_id: "s1",
    status: "closed",
    created_at: "",
    assignee_id: "u2",
  },
  {
    id: "t4",
    task_no: "4",
    title: "T4",
    user_story_id: "s1",
    status: "removed",
    created_at: "",
    assignee_id: undefined,
  },
  {
    id: "t5",
    task_no: "5",
    title: "T5",
    user_story_id: "s1",
    status: "new",
    created_at: "",
    assignee_id: undefined,
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockedTasksApi.getAll.mockResolvedValue(TASKS as never);
  mockedUsersApi.getAll.mockResolvedValue(USERS);
});

describe("useOverviewData", () => {
  it("computes taskStats correctly from fetched tasks", async () => {
    const { result } = renderHook(() => useOverviewData(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.taskStats).toEqual({
      total: 5,
      new: 2,
      active: 1,
      closed: 1,
      removed: 1,
    });
  });

  it("counts unassigned open tasks correctly", async () => {
    const { result } = renderHook(() => useOverviewData(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // t4=removed (not open), t5=new+unassigned → 1 unassigned open
    expect(result.current.unassignedOpen).toBe(1);
  });

  it("builds workload per user sorted by open tasks desc", async () => {
    const { result } = renderHook(() => useOverviewData(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    // u1 has t1(new)+t2(active) = 2 open; u2 has t3(closed) = 0 open
    expect(result.current.workload[0].userId).toBe("u1");
    expect(result.current.workload[0].open).toBe(2);
    expect(result.current.workload[0].closed).toBe(0);
    expect(result.current.workload[1].userId).toBe("u2");
    expect(result.current.workload[1].open).toBe(0);
    expect(result.current.workload[1].closed).toBe(1);
  });

  it("excludes users with zero tasks from workload", async () => {
    mockedUsersApi.getAll.mockResolvedValue([
      ...USERS,
      {
        id: "u3",
        name: "Ghost",
        email: "",
        role_id: null,
        role_name: null,
        status: "ACTIVE",
        last_modified_on: null,
        last_modified_by: null,
        avatar_url: null,
        auth_provider: "email",
        created_at: "",
      },
    ]);
    const { result } = renderHook(() => useOverviewData(), {
      wrapper: wrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(
      result.current.workload.find((m) => m.userId === "u3"),
    ).toBeUndefined();
  });

  it("returns isLoading=true initially", () => {
    const { result } = renderHook(() => useOverviewData(), {
      wrapper: wrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });
});

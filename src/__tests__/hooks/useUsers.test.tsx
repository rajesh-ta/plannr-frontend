import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { useUsers, useUserById } from "@/hooks/useUsers";
import { usersApi } from "@/services/api/users";
import { renderWithProviders } from "../test-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

jest.mock("@/services/api/users");
const mockedUsersApi = usersApi as jest.Mocked<typeof usersApi>;

const mockUsers = [
  {
    id: "u1",
    name: "Alice",
    email: "a@test.com",
    status: "ACTIVE",
    role_id: null,
    role_name: null,
    avatar_url: null,
    created_at: "",
    modified_at: "",
    modified_by: null,
  },
  {
    id: "u2",
    name: "Bob",
    email: "b@test.com",
    status: "INACTIVE",
    role_id: null,
    role_name: null,
    avatar_url: null,
    created_at: "",
    modified_at: "",
    modified_by: null,
  },
];

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockedUsersApi.getAll.mockResolvedValue(mockUsers);
});

describe("useUsers", () => {
  it("fetches users and returns data", async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUsers);
  });

  it("calls usersApi.getAll once", async () => {
    const { result } = renderHook(() => useUsers(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockedUsersApi.getAll).toHaveBeenCalledTimes(1);
  });
});

describe("useUserById", () => {
  it("returns the matching user", async () => {
    const { result } = renderHook(() => useUserById("u2"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => {
      expect(result.current?.name).toBe("Bob");
    });
  });

  it("returns null when userId is undefined", async () => {
    const { result } = renderHook(() => useUserById(undefined), {
      wrapper: makeWrapper(),
    });
    expect(result.current).toBeNull();
  });

  it("returns undefined when userId does not match any user", async () => {
    const { result } = renderHook(() => useUserById("xyz"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => mockedUsersApi.getAll.mock.calls.length > 0);
    // undefined because find() returns undefined for no match
    expect(result.current).toBeUndefined();
  });
});

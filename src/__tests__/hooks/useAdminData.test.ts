import { renderHook, waitFor, act } from "@testing-library/react";
import { usersApi } from "@/services/api/users";
import { rolesApi } from "@/services/api/roles";
import { useAdminData } from "@/hooks/useAdminData";

jest.mock("@/services/api/users");
jest.mock("@/services/api/roles");

const mockedUsersApi = usersApi as jest.Mocked<typeof usersApi>;
const mockedRolesApi = rolesApi as jest.Mocked<typeof rolesApi>;

const ROLES = [
  {
    id: "r1",
    role_name: "PROJECT_ADMIN",
    description: null,
    is_active: true,
    created_at: "",
    modified_at: "",
  },
];
const USERS = [
  {
    id: "u1",
    name: "Sweta",
    email: "s@s.com",
    role_id: "r1",
    role_name: "PROJECT_ADMIN",
    status: "ACTIVE",
    last_modified_on: null,
    last_modified_by: "u2",
    avatar_url: null,
    auth_provider: "email",
    created_at: "",
  },
  {
    id: "u2",
    name: "Rajesh",
    email: "r@r.com",
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

beforeEach(() => {
  jest.clearAllMocks();
  mockedUsersApi.getAll.mockResolvedValue(USERS);
  mockedRolesApi.getAll.mockResolvedValue(ROLES);
});

describe("useAdminData", () => {
  it("does not fetch when enabled=false", () => {
    renderHook(() => useAdminData(false));
    expect(mockedUsersApi.getAll).not.toHaveBeenCalled();
  });

  it("fetches users and roles when enabled=true", async () => {
    const { result } = renderHook(() => useAdminData(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.users).toEqual(USERS);
    expect(result.current.roles).toEqual(ROLES);
    expect(result.current.error).toBeNull();
  });

  it("builds modifierNames map from last_modified_by references", async () => {
    const { result } = renderHook(() => useAdminData(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    // u1's last_modified_by = "u2" → modifierNames[u1.id] = "Rajesh"
    expect(result.current.modifierNames["u1"]).toBe("Rajesh");
    // u2 has no last_modified_by → no entry
    expect(result.current.modifierNames["u2"]).toBeUndefined();
  });

  it("sets error message when API call fails", async () => {
    mockedUsersApi.getAll.mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useAdminData(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load data. Please try again.");
    expect(result.current.users).toEqual([]);
  });

  it("fetchData can be called manually to re-fetch", async () => {
    const { result } = renderHook(() => useAdminData(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockedUsersApi.getAll).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.fetchData();
    });
    expect(mockedUsersApi.getAll).toHaveBeenCalledTimes(2);
  });

  it("setError exposes error state externally", async () => {
    const { result } = renderHook(() => useAdminData(true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setError("Custom error"));
    expect(result.current.error).toBe("Custom error");
  });
});

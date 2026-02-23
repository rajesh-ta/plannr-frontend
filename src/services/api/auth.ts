import { apiClient } from "./client";

export interface UserOut {
  id: string;
  name: string;
  email: string;
  role_id: string | null;
  role_name: string | null;
  status: string;
  last_modified_on: string | null;
  last_modified_by: string | null;
  avatar_url: string | null;
  auth_provider: string;
  created_at: string;
  /** All 12 permission keys, each True if the user's role grants it. */
  permissions: Record<string, boolean>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export const authApi = {
  register: async (payload: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(
      "/auth/register",
      payload,
    );
    return data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  googleAuth: async (credential: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>("/auth/google", {
      credential,
    });
    return data;
  },

  me: async (): Promise<UserOut> => {
    const { data } = await apiClient.get<UserOut>("/auth/me");
    return data;
  },
};

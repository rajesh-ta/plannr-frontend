import { apiClient } from "./client";

export interface UserOut {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
  auth_provider: string;
  created_at: string;
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

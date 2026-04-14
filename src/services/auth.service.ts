import { api } from "./api";

import type { AuthResponse } from "@/shared/types";

interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

export async function signUp(payload: SignUpPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/signup", payload);
  return response.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

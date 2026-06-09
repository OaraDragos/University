import type { AuthUser } from "../context/AuthContext";
import { API_URLS } from "./config";
import { apiRequest } from "./networkClient";

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type AuthSession = {
  user: AuthUser;
  token: string;
  permissionScheme: string;
  expiresAt: string;
  inactivityTimeoutMs: number;
};

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthSession>(`${API_URLS.auth}/login`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthSession>(`${API_URLS.auth}/register`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function requestLoginCode(identifier: string) {
  return apiRequest<{ message: string; code: string; expiresAt: string }>(`${API_URLS.auth}/login/code/request`, {
    method: "POST",
    body: JSON.stringify({ identifier }),
  });
}

export function verifyLoginCode(identifier: string, code: string) {
  return apiRequest<AuthSession>(`${API_URLS.auth}/login/code/verify`, {
    method: "POST",
    body: JSON.stringify({ identifier, code }),
  });
}

export function requestPasswordRecovery(email: string) {
  return apiRequest<{ message: string; code: string; expiresAt: string }>(`${API_URLS.auth}/password-recovery/request`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(email: string, code: string, newPassword: string) {
  return apiRequest<{ message: string }>(`${API_URLS.auth}/password-recovery/reset`, {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });
}

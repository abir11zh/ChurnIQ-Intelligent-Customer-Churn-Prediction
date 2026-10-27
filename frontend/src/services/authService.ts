import { mockUsers } from "../data/foundation";
import { getRolePermissions } from "../lib/permissions";
import type { Role, User } from "../types/domain";
import { apiClient, setAccessToken } from "./apiClient";

export type LoginRequest = {
  email: string;
  password: string;
  remember?: boolean;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  companyName: string;
  workspaceName: string;
  role: string;
};

function delay(ms = 650) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function login(payload: LoginRequest): Promise<User> {
  try {
    const { data } = await apiClient.post("/auth/login", {
      email: payload.email,
      password: payload.password,
      remember: payload.remember
    });
    setAccessToken(data.data.access_token);
    const apiUser = data.data.user;
    return {
      id: apiUser.id,
      fullName: apiUser.full_name,
      email: apiUser.email,
      avatar: "",
      role: apiUser.role as Role,
      permissions: getRolePermissions(apiUser.role as Role),
      workspaceId: apiUser.workspace_id,
      createdAt: apiUser.created_at,
      lastLogin: apiUser.last_login
    };
  } catch (error) {
    await delay();

    if (payload.password.toLowerCase().includes("wrong")) {
      throw new Error("Invalid email or password.");
    }

    const existing = mockUsers.find((user) => user.email.toLowerCase() === payload.email.toLowerCase());
    const user = existing ?? {
      ...mockUsers[0],
      id: "usr_mock_login",
      email: payload.email,
      fullName: payload.email.split("@")[0] || "ChurnIQ User",
      role: "Admin" as Role,
      permissions: getRolePermissions("Admin"),
      lastLogin: new Date().toISOString()
    };

    setAccessToken("mock_access_token");
    return { ...user, lastLogin: new Date().toISOString() };
  }
}

export async function register(payload: RegisterRequest): Promise<User> {
  try {
    const { data } = await apiClient.post("/auth/register", {
      full_name: payload.fullName,
      email: payload.email,
      password: payload.password,
      company_name: payload.companyName,
      role: payload.role || "Admin"
    });
    setAccessToken(data.data.access_token);
    const apiUser = data.data.user;
    return {
      id: apiUser.id,
      fullName: apiUser.full_name,
      email: apiUser.email,
      avatar: "",
      role: apiUser.role as Role,
      permissions: getRolePermissions(apiUser.role as Role),
      workspaceId: apiUser.workspace_id,
      createdAt: apiUser.created_at,
      lastLogin: apiUser.last_login
    };
  } catch {
    await delay(800);
    setAccessToken("mock_access_token");
    return {
      id: "usr_new_workspace",
      fullName: payload.fullName,
      email: payload.email,
      avatar: "",
      role: "Admin",
      permissions: getRolePermissions("Admin"),
      workspaceId: "ws_new",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
  }
}

export async function sendPasswordReset(email: string) {
  await delay();
  return { email, sent: true };
}

export async function updatePassword() {
  await delay();
  return { updated: true };
}

export async function resendVerificationEmail() {
  await delay();
  return { sent: true };
}

export async function verifyOtp(code: string) {
  await delay();
  if (code.length !== 6) throw new Error("Enter the 6-digit code.");
  return { verified: true };
}

export async function refreshToken() {
  await delay(250);
  return null;
}

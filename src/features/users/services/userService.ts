import type { SignInDto, SignUpDto, User } from "@/types/user";
import { usersApi as api } from "@/services/http";
import { getCurrentUserIdFromStorage } from "../auth/helpers";

type LoginResponse =
  | string
  | {
      token?: string;
      jwt?: string;
      accessToken?: string;
      access_token?: string;
      [key: string]: unknown;
    };

export async function signIn(dto: SignInDto): Promise<string> {
  const payload = { email: dto.email, password: dto.password };

  const { data } = await api.post<LoginResponse>("/users/login", payload);

  const token =
    typeof data === "string"
      ? data
      : data.token ?? data.jwt ?? data.accessToken ?? data.access_token;

  if (!token) throw new Error("No token found in login response");

  localStorage.setItem("token", token);
  window.dispatchEvent(new Event("auth-changed"));
  return token;
}

export async function signUp(dto: SignUpDto) {
  const { data } = await api.post<{ _id: string } | User>("/users", dto);
  return data;
}

export function signOut() {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-changed")); // keep UI/auth state in sync
}

export async function getMe() {
  const id = getCurrentUserIdFromStorage();
  if (!id) throw new Error("Missing user id in token");
  // Optional: keep error local so global bridge doesn't redirect
  const { data } = await api.get<User>(`/users/${id}`, {
    headers: { "x-local-error": "1" },
  });
  return data;
}

export async function getUserById(id: string) {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
}

export async function getAllUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

export async function updateUser(id: string, patch: Partial<User>) {
  const { data } = await api.put<User>(`/users/${id}`, patch);
  return data;
}

export async function deleteUser(id: string) {
  await api.delete(`/users/${id}`);
}

export async function changePassword(id: string, dto: { password: string }) {
  const { data } = await api.put(`/users/${id}/password`, dto);
  return data;
}

export async function changeEmail(id: string, email: string) {
  return updateUser(id, { email } as Partial<User>);
}

export default {
  signIn,
  signUp,
  signOut,
  getMe,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  changePassword,
  changeEmail,
};

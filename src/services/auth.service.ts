import api from "./http";
import type { LoginResponse } from "@/types";

export function login(username: string, password: string) {
  return api.post<LoginResponse>("/login", { username, password });
}

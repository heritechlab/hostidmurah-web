export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  balance: number;
  referral_code?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export function getStoredAuth(): AuthState {
  if (typeof window === "undefined") return { user: null, token: null };
  try {
    const token = localStorage.getItem("auth_token");
    const raw = localStorage.getItem("auth_user");
    const user: User | null = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { user: null, token: null };
  }
}

export function setStoredAuth(token: string, user: User) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(user));
  // Also set cookie so middleware can read it (not httpOnly)
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export function clearStoredAuth() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

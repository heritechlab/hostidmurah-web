"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  type User,
  getStoredAuth,
  setStoredAuth,
  clearStoredAuth,
  isTokenExpired,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, cfToken: string) => Promise<void>;
  register: (data: RegisterData, cfToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  referral_code?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth from localStorage on mount
  useEffect(() => {
    const { token: storedToken, user: storedUser } = getStoredAuth();
    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      setUser(storedUser);
    } else if (storedToken) {
      // Token expired — clear
      clearStoredAuth();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, cfToken: string) => {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        cf_token: cfToken,
      });
      const { access_token, user: userData } = data;
      setStoredAuth(access_token, userData);
      setToken(access_token);
      setUser(userData);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterData, cfToken: string) => {
      const { data } = await api.post("/auth/register", {
        ...payload,
        cf_token: cfToken,
      });
      const { access_token, user: userData } = data;
      setStoredAuth(access_token, userData);
      setToken(access_token);
      setUser(userData);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
      const { token: storedToken } = getStoredAuth();
      if (storedToken) localStorage.setItem("auth_user", JSON.stringify(data));
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

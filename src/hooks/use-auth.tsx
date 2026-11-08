"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authService } from "@/features/auth/services/auth-service";
import type { AuthUser, LoginInput } from "@/features/auth/types";
import { clearSession, getAuthToken, setSession } from "@/lib/auth-storage";
import { defer } from "@/lib/utils";

/**
 * حالة المصادقة على مستوى التطبيق: يقرأ الجلسة من الكوكيز
 * ويجلب بيانات المستخدم الحالي عبر GET /auth/me.
 */
interface AuthContextValue {
  user: AuthUser | null;
  /** true أثناء أول قراءة للجلسة */
  initializing: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const refresh = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      return;
    }
    try {
      const current = await authService.me();
      setUser(current);
    } catch {
      // توكن منتهٍ أو حساب معطّل: تُمحى الجلسة وتعود الواجهة لصفحة الدخول
      clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    defer(() => refresh().finally(() => setInitializing(false)));
  }, [refresh]);

  const login = useCallback(async (input: LoginInput) => {
    const result = await authService.login(input);
    setSession({ token: result.token, role: result.user.role });
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = { user, initializing, login, logout, refresh };

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

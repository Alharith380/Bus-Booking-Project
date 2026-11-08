import type { Role } from "@/types";
import { ROLE_COOKIE, SESSION_MAX_AGE_SECONDS, TOKEN_COOKIE } from "@/constants/session";

/**
 * تنظيم تخزين جلسة الدخول في ملفات ارتباط قابلة للقراءة من proxy ومن المتصفح.
 * التوكن يُقرأ من api-client لإضافة ترويسة Authorization.
 */

function writeCookie(name: string, value: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${SESSION_MAX_AGE_SECONDS}; samesite=lax`;
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export interface Session {
  token: string;
  role: Role;
}

/** حفظ الجلسة بعد تسجيل الدخول الناجح */
export function setSession(session: Session): void {
  writeCookie(TOKEN_COOKIE, session.token);
  writeCookie(ROLE_COOKIE, session.role);
}

/** التوكن الحالي أو null */
export function getAuthToken(): string | null {
  return readCookie(TOKEN_COOKIE);
}

/** دور المستخدم الحالي أو null */
export function getSessionRole(): Role | null {
  const role = readCookie(ROLE_COOKIE);
  return role ? (role as Role) : null;
}

/** حذف الجلسة (تسجيل الخروج يتم في الواجهة بحذف التوكن) */
export function clearSession(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; samesite=lax`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

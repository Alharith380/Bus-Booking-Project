import type { Role } from "@/types";

/** بيانات المستخدم كما تعود من الخادم */
export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: Role;
}

/** طلب تسجيل الدخول */
export interface LoginInput {
  phone: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  phone: string;
  email?: string;
  password: string;
}

/** استجابة تسجيل الدخول والتسجيل */
export interface AuthSession {
  user: AuthUser;
  token: string;
}

import { api } from "@/lib/api-client";
import type { AuthSession, AuthUser, LoginInput, RegisterInput } from "@/features/auth/types";

/**
 * خدمات المصادقة — العقد §2:
 * POST /auth/login، GET /auth/me، PATCH /auth/me، POST /auth/change-password.
 * تسجيل الخروج يتم في الواجهة بحذف التوكن فلا endpoint له.
 */
export const authService = {
  /** تسجيل الدخول لكل الأدوار */
  async login(input: LoginInput): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>("/auth/login", input);
    return data;
  },

  async register(input: RegisterInput): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>("/auth/register", input);
    return data;
  },

  /** بيانات المستخدم الحالي */
  async me(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser | { user: AuthUser }>("/auth/me");
    // بعض التركيبات تغلّف المستخدم داخل { user }
    return data && "user" in data ? data.user : (data as AuthUser);
  },

  /** تعديل الملف الشخصي */
  async updateProfile(input: Partial<Pick<AuthUser, "fullName" | "email">>): Promise<AuthUser> {
    const { data } = await api.patch<AuthUser>("/auth/me", input);
    return data;
  },

  /** تغيير كلمة السر */
  async changePassword(input: { currentPassword: string; newPassword: string }): Promise<void> {
    await api.post("/auth/change-password", input);
  },
};

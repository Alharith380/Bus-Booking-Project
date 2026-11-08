import type { PageMeta, Role } from "@/types";

/** حساب موظف داخل النظام — العقد §3 */
export interface SystemUser {
  id: string;
  fullName: string;
  phone: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
}

/** استعلام قائمة المستخدمين */
export interface UsersQuery {
  role?: Role | "";
  q?: string;
  isActive?: boolean | "";
  page?: number;
  limit?: number;
}

/** إنشاء موظف جديد */
export interface CreateUserInput {
  fullName: string;
  phone: string;
  password: string;
  role: Exclude<Role, "CUSTOMER">;
}

/** تعديل بيانات موظف */
export interface UpdateUserInput {
  fullName?: string;
  phone?: string;
  role?: Exclude<Role, "CUSTOMER">;
}

export type UsersResult = { users: SystemUser[]; meta?: PageMeta };

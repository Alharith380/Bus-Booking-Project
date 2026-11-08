import type { Role } from "@/types";

/**
 * تنظيم الصلاحيات وفق مصفوفة العقد: المدير يرث صلاحيات موظف الاستقبال.
 * تُستعمل لعرض عناصر التنقل وحماية المسارات في الواجهة؛
 * التحقق النهائي من الصلاحية يبقى على الخادم في كل endpoint.
 */

/** المسار الأساسي لكل دور بعد تسجيل الدخول */
export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  RECEPTIONIST: "/reception",
  SUPERVISOR: "/admin",
  CUSTOMER: "/login",
};

/** صلاحيات كل دور — مصفوفة العقد §17 */
const PERMISSIONS: Record<Role, ReadonlySet<string>> = {
  ADMIN: new Set([
    "users",
    "customers",
    "cities:write",
    "trips:write",
    "schedules",
    "holds",
    "bookings:create",
    "bookings:read:all",
    "bookings:write",
    "payments",
    "reports",
    "drivers",
    "boarding",
    "trips:complete",
  ]),
  RECEPTIONIST: new Set([
    "customers",
    "holds",
    "bookings:create",
    "bookings:read:all",
    "bookings:write",
    "payments",
    "boarding",
  ]),
  SUPERVISOR: new Set(["boarding", "trips:read:crew"]),
  CUSTOMER: new Set(["holds", "bookings:create", "bookings:read:own"]),
};

export function hasPermission(role: Role | null, permission: string): boolean {
  if (!role) return false;
  return PERMISSIONS[role].has(permission);
}

/** صلاحية قراءة عامة متاحة لكل الأدوار المسجلة */
export function canReadTrips(role: Role | null): boolean {
  return role !== null;
}

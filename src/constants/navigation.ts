import type { Role } from "@/types";

/** بيانات عنصر تنقل واحد في الشريط الجانبي */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** الأدوار التي يظهر لها العنصر */
  roles: Role[];
  /** تُخفى في الشريط المدمج على الموبايل (بعد الخمسة الأولى) */
  mobileHidden?: boolean;
}

const icons = {
  dashboard: "/assets/3ebe2.svg",
  employees: "/assets/e7729.svg",
  busTypes: "/assets/29b58.svg",
  fleet: "/assets/06df0.svg",
  routes: "/assets/a9734.svg",
  trips: "/assets/c9550.svg",
  repeat: "/assets/bafcb.svg",
  tickets: "/assets/1cf6b.svg",
  reports: "/assets/8bce8.svg",
  settings: "/assets/755f2.svg",
  search: "/assets/6ffdf.svg",
  logout: "/assets/e8f88.svg",
  brand: "/assets/e3991.svg",
  alert: "/assets/2af41.svg",
  error: "/assets/4e9fb.svg",
  info: "/assets/5ef07.svg",
  shield: "/assets/0a3c6.svg",
  busFront: "/assets/9d9cf.svg",
  cabin: "/assets/c12be.svg",
} as const;

export const NAV_ICONS = icons;

/** عناصر التنقل — تُرشَّح حسب الدور في الشريط الجانبي */
export const NAV_ITEMS: NavItem[] = [
  { label: "الرئيسية", href: "/admin", icon: icons.dashboard, roles: ["ADMIN", "SUPERVISOR"] },
  { label: "البحث والحجز", href: "/reception", icon: icons.search, roles: ["RECEPTIONIST", "ADMIN"] },
  { label: "الموظفون", href: "/admin/users", icon: icons.employees, roles: ["ADMIN"] },
  { label: "أنواع الحافلات",   href: "/admin/bus-types", icon: icons.busTypes, roles: ["ADMIN"] },
  { label: "الأسطول", href: "/admin/buses", icon: icons.fleet, roles: ["ADMIN"] },
  { label: "المدن", href: "/admin/cities", icon: icons.routes, roles: ["ADMIN"] },
  { label: "المسارات", href: "/admin/routes", icon: icons.routes, roles: ["ADMIN"] },
  { label: "مخططات المقاعد", href: "/admin/seat-layouts", icon: icons.busTypes, roles: ["ADMIN"] },
  { label: "الرحلات", href: "/admin/trips", icon: icons.trips, roles: ["ADMIN", "SUPERVISOR"] },
  {
    label: "الجداول المتكررة",
    href: "/admin/trips/schedules",
    icon: icons.repeat,
    roles: ["ADMIN"],
    mobileHidden: true,
  },
  {
    label: "كل الحجوزات",
    href: "/reception/bookings",
    icon: icons.tickets,
    roles: ["RECEPTIONIST", "ADMIN"],
    mobileHidden: true,
  },
  { label: "التقارير", href: "/admin/reports", icon: icons.reports, roles: ["ADMIN"], mobileHidden: true },
  {
    label: "إعدادات الشركة",
    href: "/admin/settings",
    icon: icons.settings,
    roles: ["ADMIN"],
    mobileHidden: true,
  },
];

/** العناصر المرئية لدور معيّن */
export function navItemsForRole(role: Role | null): NavItem[] {
  if (!role) return [];
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

/** عناوين أقسام لا تظهر في قائمة التنقل */
const EXTRA_SECTIONS: Array<{ href: string; label: string }> = [
  { href: "/admin/trips/new", label: "إنشاء رحلة" },
  { href: "/reception/trips", label: "اختيار المقاعد" },
];

/** عنوان القسم الحالي من مسار الصفحة — يُستعمل في الشريط العلوي */
export function sectionLabelForPath(pathname: string): string {
  const candidates = [
    ...NAV_ITEMS.map(({ href, label }) => ({ href, label })),
    ...EXTRA_SECTIONS,
  ].sort((a, b) => b.href.length - a.href.length);

  const match = candidates.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? "الرئيسية";
}

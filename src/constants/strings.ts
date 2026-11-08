"use client";

/** نصوص ثابتة تُستعمل في أكثر من ميزة */

export const APP_NAME = "حجز البولمان";
export const APP_TAGLINE = "مساحة إدارة الشركة";

/** أسماء الأدوار بالعربية */
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: "مدير النظام",
  RECEPTIONIST: "موظف استقبال",
  SUPERVISOR: "مشرف رحلة",
  CUSTOMER: "زبون",
};

/** حالات الرحلة بالعربية */
export const TRIP_STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "مجدولة",
  CANCELLED: "ملغاة",
  COMPLETED: "منتهية",
};

/** حالات الحجز */
export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: "بانتظار الدفع",
  CONFIRMED: "مؤكد",
  CANCELLED: "ملغى",
  EXPIRED: "منتهي المهلة",
  COMPLETED: "مكتمل",
};

/** حالات الدفع */
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: "غير مدفوع",
  PAID: "مدفوع",
  PARTIALLY_PAID: "مدفوع جزئياً",
  REFUNDED: "مسترجع",
};

/** حالات البولمان */
export const BUS_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "تشغيلية",
  MAINTENANCE: "صيانة",
  INACTIVE: "غير نشطة",
};

/** حالات المقعد في توفر المقاعد */
export const SEAT_STATE_LABELS: Record<string, string> = {
  AVAILABLE: "متاح",
  HELD: "محتجز",
  BOOKED: "محجوز",
};

/** حالات الحجز */
export const CUSTOMER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "نشط",
  INACTIVE: "غير نشط",
};

/** اقتران الحالة بدرجة شارة العرض */
export const TRIP_STATUS_TONES: Record<string, "success" | "danger" | "neutral"> = {
  SCHEDULED: "success",
  CANCELLED: "danger",
  COMPLETED: "neutral",
};

export const BOOKING_STATUS_TONES: Record<
  string,
  "success" | "warning" | "danger" | "neutral" | "info"
> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "danger",
  EXPIRED: "neutral",
  COMPLETED: "info",
};

export const PAYMENT_STATUS_TONES: Record<
  string,
  "success" | "warning" | "danger" | "neutral"
> = {
  PAID: "success",
  PARTIALLY_PAID: "warning",
  UNPAID: "danger",
  REFUNDED: "neutral",
};

export const BUS_STATUS_TONES: Record<string, "success" | "warning" | "neutral"> = {
  ACTIVE: "success",
  MAINTENANCE: "warning",
  INACTIVE: "neutral",
};

/** أنماط ترتيب المقاعد المسموحة في العقد */
export const SEAT_PATTERNS = ["2+2", "2+1", "1+1"] as const;

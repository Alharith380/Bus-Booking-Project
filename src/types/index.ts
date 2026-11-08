/**
 * أنواع مشتركة بين ميزتين أو أكثر (Enums وعقود الـ API العامة).
 * الأنواع الخاصة بالميزة تبقى في features/<name>/types.ts.
 */

/** أدوار المستخدمين وفق عقد الـ API */
export type Role = "CUSTOMER" | "RECEPTIONIST" | "ADMIN" | "SUPERVISOR";

export type BusStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";
export type TripStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PAID" | "PARTIALLY_PAID" | "REFUNDED";
export type PaymentMethod = "CASH";
export type HoldStatus = "ACTIVE" | "RELEASED" | "EXPIRED" | "CONVERTED";
export type SeatType = "NORMAL" | "VIP";
export type ColumnPosition =
  | "LEFT_WINDOW"
  | "LEFT_INNER"
  | "AISLE"
  | "RIGHT_INNER"
  | "RIGHT_WINDOW";
export type SeatState = "AVAILABLE" | "HELD" | "BOOKED";
export type CrewType = "DRIVER" | "ASSISTANT";
export type BoardingStatus = "NOT_BOARDED" | "BOARDED";

/** meta المصاحبة للقوائم الطويلة */
export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}

/** شكل الخطأ الموحّد */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
}

/** شكل الاستجابة الناجحة */
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

/** شكل الاستجابة الفاشلة */
export interface ApiFailure {
  success: false;
  error: ApiError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

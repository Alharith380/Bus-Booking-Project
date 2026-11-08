import type { BookingStatus, PageMeta, PaymentStatus } from "@/types";

/** ملخص حجز — العقد §10 */
export interface Booking {
  id: string;
  bookingReference: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalPrice: number;
  expiresAt?: string;
  createdAt?: string;
  trip?: {
    id: string;
    origin: string;
    destination: string;
    departureDateTime: string;
  };
  seats?: { seatNumber: string; passengerName: string; seatPrice: number }[];
}

/** تفاصيل حجز مع حالة الصعود لكل مقعد */
export interface BookingDetail extends Booking {
  passengers?: {
    seatId: string;
    seatNumber: string;
    passengerName: string;
    passengerPhone?: string;
    seatPrice: number;
    boardingStatus: "NOT_BOARDED" | "BOARDED";
  }[];
}

/** بيانات التذكرة الإلكترونية — qrPayload موقّع من الخادم */
export interface Ticket {
  bookingReference: string;
  qrPayload: string;
  status: BookingStatus;
}

/** معاينة الإلغاء */
export interface CancelPreview {
  allowed: boolean;
  refundAmount: number;
  refundPercent: number;
}

/** استعلام قائمة الحجوزات */
export interface BookingsQuery {
  status?: BookingStatus | "";
  q?: string;
  page?: number;
  limit?: number;
}

export type BookingsResult = { bookings: Booking[]; meta?: PageMeta };

import type { PageMeta } from "@/types";

/** احتجاز مؤقت للمقاعد — العقد §9 */
export interface Hold {
  holdId: string;
  tripId: string;
  seatIds: string[];
  expiresAt: string;
}

/** زبون للبحث أو الإنشاء — العقد §4 */
export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
}

/** مسافر داخل طلب الحجز — العقد §10 */
export interface PassengerInput {
  seatId: string;
  passengerName: string;
  passengerPhone?: string;
  passengerDocument?: string;
}

/** إنشاء حجز من احتجاز */
export interface CreateBookingInput {
  tripId: string;
  holdId: string;
  /** يُرسل من الاستقبال فقط؛ الزبون يؤخذ من التوكن */
  customerId?: string;
  passengers: PassengerInput[];
}

/** ناتج إنشاء الحجز */
export interface CreatedBooking {
  id: string;
  bookingReference: string;
  status: string;
  paymentStatus: string;
  totalPrice: number;
  expiresAt?: string;
}

export type CustomersResult = { customers: Customer[]; meta?: PageMeta };

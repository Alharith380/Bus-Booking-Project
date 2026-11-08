import { api } from "@/lib/api-client";
import type {
  CreateBookingInput,
  CreatedBooking,
  Customer,
  CustomersResult,
  Hold,
} from "@/features/desk/types";

/**
 * خدمات الشباك — العقد §4 (الزبائن)، §9 (الاحتجاز)، §10 (إنشاء الحجز).
 * الاحتجاز كله أو لا شيء: مقعد واحد غير متاح يفشل الطلب كله بـ SEAT_ALREADY_BOOKED.
 */
export const deskService = {
  /* ----- الزبائن §4 ----- */
  async searchCustomers(phone: string): Promise<CustomersResult> {
    const { data, meta } = await api.get<Customer[]>("/customers", { phone });
    return { customers: data, meta };
  },

  async createCustomer(input: { fullName: string; phone: string; email?: string }): Promise<Customer> {
    const { data } = await api.post<Customer>("/customers", input);
    return data;
  },

  /* ----- احتجاز المقاعد §9 ----- */
  async createHold(tripId: string, seatIds: string[]): Promise<Hold> {
    const { data } = await api.post<Hold>("/holds", { tripId, seatIds });
    return data;
  },

  async releaseHold(holdId: string): Promise<void> {
    await api.delete(`/holds/${holdId}`);
  },

  /* ----- إنشاء الحجز §10 ----- */
  async createBooking(input: CreateBookingInput): Promise<CreatedBooking> {
    const { data } = await api.post<CreatedBooking>("/bookings", input);
    return data;
  },
};

import { api } from "@/lib/api-client";
import type {
  Booking,
  BookingDetail,
  BookingsQuery,
  BookingsResult,
  CancelPreview,
  Ticket,
} from "@/features/bookings/types";

/**
 * خدمات الحجوزات — العقد §10 و§11.
 * الإنشاء من احتجاز (holds) في ميزة الشباك؛ هنا القراءة والتعديل والإلغاء والتذكرة.
 */
export const bookingsService = {
  /** حجوزات الزبون الحالي */
  async listMine(query: BookingsQuery = {}): Promise<BookingsResult> {
    const { data, meta } = await api.get<Booking[]>("/bookings/my", {
      status: query.status || undefined,
      page: query.page,
      limit: query.limit,
    });
    return { bookings: data, meta };
  },

  /** قائمة الحجوزات (استقبال ومدير) */
  async list(query: BookingsQuery = {}): Promise<BookingsResult> {
    const { data, meta } = await api.get<Booking[]>("/bookings", {
      status: query.status || undefined,
      page: query.page,
      limit: query.limit,
    });
    return { bookings: data, meta };
  },

  /** بحث برقم الحجز BK-XXXXXX */
  async byReference(ref: string): Promise<Booking> {
    const { data } = await api.get<Booking>(`/bookings/by-reference/${encodeURIComponent(ref)}`);
    return data;
  },

  async getById(id: string): Promise<BookingDetail> {
    const { data } = await api.get<BookingDetail>(`/bookings/${id}`);
    return data;
  },

  /** تعديل بيانات المسافرين */
  async update(id: string, input: { passengers?: unknown }): Promise<BookingDetail> {
    const { data } = await api.patch<BookingDetail>(`/bookings/${id}`, input);
    return data;
  },

  /** معاينة الإلغاء بـ confirm=false ثم التنفيذ بـ true */
  async cancel(id: string, input: { reason: string; confirm: boolean }): Promise<CancelPreview | { done: true }> {
    const { data } = await api.post<CancelPreview>(`/bookings/${id}/cancel`, input);
    return data;
  },

  /** بيانات التذكرة الإلكترونية (qrPayload موقّع) */
  async getTicket(id: string): Promise<Ticket> {
    const { data } = await api.get<Ticket>(`/bookings/${id}/ticket`);
    return data;
  },

  /** بيانات الإيصال للطباعة */
  async getReceipt(id: string): Promise<Record<string, unknown>> {
    const { data } = await api.get<Record<string, unknown>>(`/bookings/${id}/receipt`);
    return data;
  },

  /** تسجيل دفع نقدي وتأكيد الحجز */
  async pay(id: string, input: { amount: number; method: "CASH" }): Promise<Booking> {
    const { data } = await api.post<Booking>(`/bookings/${id}/payments`, input);
    return data;
  },

  /** دفعات حجز */
  async listPayments(id: string): Promise<unknown[]> {
    const { data } = await api.get<unknown[]>(`/bookings/${id}/payments`);
    return data;
  },
};

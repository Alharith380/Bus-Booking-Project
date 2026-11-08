import { api } from "@/lib/api-client";
import type {
  CreateTripInput,
  Schedule,
  ScheduleGenerationResult,
  TripDetail,
  TripSearchQuery,
  TripSearchResult,
  TripSeatsResult,
  TripsResult,
} from "@/features/trips/types";
import type { TripStatus } from "@/types";

/**
 * خدمات الرحلات والجداول — العقد §7 و§8.
 * البحث والتفاصيل والمقاعد متاحة للجميع؛ الكتابة للـ ADMIN.
 */
export const tripsService = {
  /** بحث الزبون عن رحلات متاحة */
  async search(query: TripSearchQuery): Promise<TripSearchResult[]> {
    const { data } = await api.get<TripSearchResult[]>("/trips/search", {
      originCityId: query.originCityId,
      destinationCityId: query.destinationCityId,
      date: query.date,
    });
    return data;
  },

  /** تفاصيل رحلة */
  async getById(id: string): Promise<TripDetail> {
    const { data } = await api.get<TripDetail>(`/trips/${id}`);
    return data;
  },

  /** حالة كل مقعد في الرحلة — أهم endpoint للشباك */
  async getSeats(tripId: string): Promise<TripSeatsResult> {
    const { data } = await api.get<TripSeatsResult>(`/trips/${tripId}/seats`);
    return data;
  },

  /** قائمة الرحلات مع فلاتر (ADMIN) */
  async list(query: { status?: TripStatus | ""; date?: string; page?: number; limit?: number } = {}): Promise<TripsResult> {
    const { data, meta } = await api.get<TripSearchResult[]>("/trips", {
      status: query.status || undefined,
      date: query.date,
      page: query.page,
      limit: query.limit,
    });
    return { trips: data, meta };
  },

  async create(input: CreateTripInput): Promise<TripDetail> {
    const { data } = await api.post<TripDetail>("/trips", input);
    return data;
  },

  async update(id: string, input: Partial<CreateTripInput>): Promise<TripDetail> {
    const { data } = await api.patch<TripDetail>(`/trips/${id}`, input);
    return data;
  },

  /** إلغاء رحلة — confirm=false معاينة فقط */
  async cancel(
    id: string,
    input: { reason: string; confirm: boolean },
  ): Promise<{ affectedBookings: number; willCancel: boolean; notified?: number }> {
    const { data } = await api.post<{ affectedBookings: number; willCancel: boolean; notified?: number }>(
      `/trips/${id}/cancel`,
      input,
    );
    return data;
  },

  /** إنهاء الرحلة يدوياً */
  async complete(id: string): Promise<void> {
    await api.post(`/trips/${id}/complete`);
  },

  /* ----- الجداول المتكررة §8 ----- */

  async listSchedules(): Promise<Schedule[]> {
    const { data } = await api.get<Schedule[]>("/schedules");
    return data;
  },

  async createSchedule(input: Omit<Schedule, "id" | "isActive">): Promise<Schedule> {
    const { data } = await api.post<Schedule>("/schedules", input);
    return data;
  },

  async getSchedule(id: string): Promise<Schedule> {
    const { data } = await api.get<Schedule>(`/schedules/${id}`);
    return data;
  },

  async setScheduleStatus(id: string, isActive: boolean): Promise<void> {
    await api.patch(`/schedules/${id}/status`, { isActive });
  },

  /** معاينة التعارضات قبل التوليد — لا يكتب شيئاً */
  async previewSchedule(id: string, range: { from: string; to: string }): Promise<ScheduleGenerationResult> {
    const { data } = await api.post<ScheduleGenerationResult>(`/schedules/${id}/preview`, range);
    return data;
  },

  /** توليد الرحلات الفعلية */
  async generateSchedule(id: string, range: { from: string; to: string }): Promise<ScheduleGenerationResult> {
    const { data } = await api.post<ScheduleGenerationResult>(`/schedules/${id}/generate`, range);
    return data;
  },
};

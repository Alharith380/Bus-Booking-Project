import { api } from "@/lib/api-client";
import type {
  Bus,
  BusInput,
  BusType,
  BusesResult,
  CreateSeatLayoutInput,
  SeatLayout,
} from "@/features/fleet/types";
import type { BusStatus } from "@/types";

/**
 * خدمات الأسطول — العقد §6:
 * /bus-types، /seat-layouts، /buses.
 */
export const fleetService = {
  /* ----- أنواع البولمان ----- */
  async listBusTypes(): Promise<BusType[]> {
    const { data } = await api.get<BusType[]>("/bus-types");
    return data;
  },

  async createBusType(input: { name: string; description?: string }): Promise<BusType> {
    const { data } = await api.post<BusType>("/bus-types", input);
    return data;
  },

  async updateBusType(id: string, input: { name?: string; description?: string }): Promise<BusType> {
    const { data } = await api.patch<BusType>(`/bus-types/${id}`, input);
    return data;
  },

  /* ----- مخططات المقاعد ----- */
  async listSeatLayouts(busTypeId?: string): Promise<SeatLayout[]> {
    const { data } = await api.get<SeatLayout[]>("/seat-layouts", { busTypeId });
    return data;
  },

  async getSeatLayout(id: string): Promise<SeatLayout> {
    const { data } = await api.get<SeatLayout>(`/seat-layouts/${id}`);
    return data;
  },

  async createSeatLayout(input: CreateSeatLayoutInput): Promise<SeatLayout> {
    const { data } = await api.post<SeatLayout>("/seat-layouts", input);
    return data;
  },

  async updateSeatLayout(id: string, input: { name?: string }): Promise<SeatLayout> {
    const { data } = await api.patch<SeatLayout>(`/seat-layouts/${id}`, input);
    return data;
  },

  async updateSeat(
    layoutId: string,
    seatId: string,
    input: { seatType?: string; isActive?: boolean },
  ): Promise<void> {
    await api.patch(`/seat-layouts/${layoutId}/seats/${seatId}`, input);
  },

  /* ----- البولمانات ----- */
  async listBuses(status?: BusStatus | ""): Promise<BusesResult> {
    const { data, meta } = await api.get<Bus[]>("/buses", { status: status || undefined });
    return { buses: data, meta };
  },

  async getBus(id: string): Promise<Bus> {
    const { data } = await api.get<Bus>(`/buses/${id}`);
    return data;
  },

  async createBus(input: BusInput): Promise<Bus> {
    const { data } = await api.post<Bus>("/buses", input);
    return data;
  },

  async updateBus(id: string, input: Partial<BusInput>): Promise<Bus> {
    const { data } = await api.patch<Bus>(`/buses/${id}`, input);
    return data;
  },

  async setBusStatus(id: string, status: BusStatus): Promise<void> {
    await api.patch(`/buses/${id}/status`, { status });
  },
};

import { api } from "@/lib/api-client";
import type { BoardingManifest, BoardingTrip } from "@/features/boarding/types";

export const boardingService = {
  async listTrips(date: string): Promise<BoardingTrip[]> {
    const { data } = await api.get<BoardingTrip[]>("/boarding/trips", { date });
    return data;
  },

  async manifest(tripId: string): Promise<BoardingManifest> {
    const { data } = await api.get<BoardingManifest>(`/boarding/trips/${tripId}/passengers`);
    return data;
  },

  async scan(input: { tripId: string; qrPayload?: string; bookingReference?: string }) {
    const { data } = await api.post(`/boarding/scan`, input);
    return data;
  },

  async checkIn(input: { tripId: string; bookingId: string; seatIds: string[] }) {
    const { data } = await api.post(`/boarding/check-in`, input);
    return data;
  },

  async undo(input: { tripId: string; bookingId: string; seatIds: string[]; reason: string }) {
    const { data } = await api.post(`/boarding/undo`, input);
    return data;
  },
};

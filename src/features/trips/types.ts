import type { ColumnPosition, PageMeta, SeatState, SeatType, TripStatus } from "@/types";

/** نتيجة بحث الرحلات — العقد §7 GET /trips/search */
export interface TripSearchResult {
  id: string;
  status: TripStatus;
  origin: { id: string; name: string };
  destination: { id: string; name: string };
  departureDateTime: string;
  arrivalDateTime: string;
  price: number;
  bus: { busName: string; busType: string };
  availableSeats: number;
  totalSeats: number;
}

/** مقعد في حالة الرحلة — العقد §7 GET /trips/:id/seats */
export interface TripSeat {
  seatId: string;
  seatNumber: string;
  rowNumber: number;
  columnPosition: ColumnPosition;
  seatType: SeatType;
  state: SeatState;
  heldByMe: boolean;
  isActive?: boolean;
}

export interface TripSeatsResult {
  tripId: string;
  totalSeats: number;
  seats: TripSeat[];
}

/** تفاصيل رحلة */
export interface TripDetail extends TripSearchResult {
  routeId?: string;
  busId?: string;
  driver?: { id: string; fullName: string };
  assistant?: { id: string; fullName: string };
}

/** استعلام بحث الرحلات */
export interface TripSearchQuery {
  originCityId?: string;
  destinationCityId?: string;
  date?: string;
}

/** إنشاء رحلة — العقد §7 POST /trips */
export interface CreateTripInput {
  routeId: string;
  busId: string;
  departureDateTime: string;
  arrivalDateTime: string;
  price: number;
  driverId?: string;
  assistantId?: string;
}

/** سجل جدول متكرر — العقد §8 */
export interface Schedule {
  id: string;
  routeId: string;
  busId: string;
  departureTime: string;
  durationMinutes: number;
  recurrenceRule: { type: "DAILY" | "WEEKLY" | "MONTHLY"; daysOfWeek?: number[]; daysOfMonth?: number[] };
  startDate: string;
  endDate: string;
  price: number;
  isActive: boolean;
  driverId?: string;
  assistantId?: string;
}

/** معاينة أو توليد جدول — العقد §8 */
export interface ScheduleGenerationResult {
  willCreate?: string[];
  created?: string[];
  skippedDuplicates: string[];
  conflicts: { date: string; reason: string }[];
}

export type TripsResult = { trips: TripSearchResult[]; meta?: PageMeta };

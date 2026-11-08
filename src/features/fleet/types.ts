import type { BusStatus, ColumnPosition, PageMeta, SeatType } from "@/types";

/** نوع البولمان (قالب) — العقد §6 */
export interface BusType {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

/** مقعد داخل مخطط المقاعد */
export interface Seat {
  id: string;
  seatNumber: string;
  rowNumber: number;
  columnPosition: ColumnPosition;
  seatType: SeatType;
  isActive: boolean;
}

/** مخطط مقاعد البولمان */
export interface SeatLayout {
  id: string;
  name: string;
  busTypeId?: string;
  totalSeats: number;
  seats?: Seat[];
}

/** مدخل إنشاء مخطط مقاعد — يولّد المقاعد تلقائياً */
export interface CreateSeatLayoutInput {
  busTypeId: string;
  name: string;
  pattern: "2+2" | "2+1" | "1+1";
  rows: number;
  lastRowExtraSeats?: number;
}

/** بولمان (مركبة) — العقد §6 */
export interface Bus {
  id: string;
  busTypeId: string;
  seatLayoutId: string;
  plateNumber: string;
  busName: string;
  status: BusStatus;
  busType?: { id: string; name: string };
  seatLayout?: { id: string; name: string; totalSeats?: number };
}

/** إنشاء أو تعديل بولمان */
export interface BusInput {
  busTypeId: string;
  seatLayoutId: string;
  plateNumber: string;
  busName: string;
}

export type BusesResult = { buses: Bus[]; meta?: PageMeta };

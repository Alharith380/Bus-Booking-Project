export type SeatStatus = 'available' | 'selected' | 'occupied';

export type Seat = {
  id: string;
  status: SeatStatus;
};

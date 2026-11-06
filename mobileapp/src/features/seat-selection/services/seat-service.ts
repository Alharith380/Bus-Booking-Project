import type { Seat } from '@/features/seat-selection/types';

export type SeatService = {
  getSeats(tripId: string): Promise<Seat[]>;
};

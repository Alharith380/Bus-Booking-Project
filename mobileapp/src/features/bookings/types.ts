import type { Trip } from '@/features/trips/types';

export type Booking = {
  id: string;
  trip: Trip;
  seat: string;
  passengerName?: string;
  bookedAt: string;
};

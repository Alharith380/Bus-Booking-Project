import type { Booking } from '@/features/bookings/types';

export type BookingsService = {
  getBookings(): Promise<Booking[]>;
  getBookingById(id: string): Promise<Booking>;
  createBooking(tripId: string, seat: string): Promise<Booking>;
};

import type { Trip } from '@/features/trips/types';

export type TripsService = {
  getTripById(id: string): Promise<Trip>;
};

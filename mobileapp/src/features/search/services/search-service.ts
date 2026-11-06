import type { TripSearch } from '@/features/search/types';
import type { Trip } from '@/features/trips/types';

export type SearchService = {
  searchTrips(search: TripSearch): Promise<Trip[]>;
};

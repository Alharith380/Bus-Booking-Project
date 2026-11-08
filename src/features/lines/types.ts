import type { PageMeta } from "@/types";

/** مدينة — العقد §5 */
export interface City {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
}

/** مسار بين مدينتين — العقد §5 */
export interface Route {
  id: string;
  originCityId: string;
  destinationCityId: string;
  description?: string;
  isActive: boolean;
  origin?: City;
  destination?: City;
}

/** إنشاء مدينة */
export interface CityInput {
  name: string;
  code: string;
}

/** إنشاء مسار */
export interface RouteInput {
  originCityId: string;
  destinationCityId: string;
  description?: string;
}

export type RoutesResult = { routes: Route[]; meta?: PageMeta };

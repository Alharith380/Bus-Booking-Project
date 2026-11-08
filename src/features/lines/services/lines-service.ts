import { api } from "@/lib/api-client";
import type { City, CityInput, Route, RouteInput, RoutesResult } from "@/features/lines/types";

/**
 * خدمات المدن والمسارات — العقد §5:
 * /cities (قراءة للجميع، كتابة ADMIN)، /routes (ADMIN, RECEPTIONIST للقراءة).
 */
export const linesService = {
  async listCities(): Promise<City[]> {
    const { data } = await api.get<City[]>("/cities");
    return data;
  },

  async createCity(input: CityInput): Promise<City> {
    const { data } = await api.post<City>("/cities", input);
    return data;
  },

  async updateCity(id: string, input: Partial<CityInput> & { isActive?: boolean }): Promise<City> {
    const { data } = await api.patch<City>(`/cities/${id}`, input);
    return data;
  },

  async listRoutes(query: { originCityId?: string; destinationCityId?: string } = {}): Promise<RoutesResult> {
    const { data, meta } = await api.get<Route[]>("/routes", {
      originCityId: query.originCityId,
      destinationCityId: query.destinationCityId,
    });
    return { routes: data, meta };
  },

  async createRoute(input: RouteInput): Promise<Route> {
    const { data } = await api.post<Route>("/routes", input);
    return data;
  },

  async updateRoute(id: string, input: Partial<RouteInput>): Promise<Route> {
    const { data } = await api.patch<Route>(`/routes/${id}`, input);
    return data;
  },

  async setRouteStatus(id: string, isActive: boolean): Promise<void> {
    await api.patch(`/routes/${id}/status`, { isActive });
  },
};

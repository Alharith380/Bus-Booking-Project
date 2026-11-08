import { api } from "@/lib/api-client";
import type { CrewMember, CrewQuery, CrewResult, CrewType } from "@/features/crew/types";

export const crewService = {
  async list(query: CrewQuery = {}): Promise<CrewResult> {
    const { data, meta } = await api.get<CrewMember[]>("/drivers", {
      q: query.q,
      crewType: query.crewType || undefined,
      isActive: query.isActive,
      page: query.page,
      limit: query.limit,
    });
    return { crew: data, meta };
  },

  async create(input: {
    fullName: string;
    phone: string;
    licenseNumber?: string;
    crewType: CrewType;
  }): Promise<CrewMember> {
    const { data } = await api.post<CrewMember>("/drivers", input);
    return data;
  },

  async getById(id: string): Promise<CrewMember> {
    const { data } = await api.get<CrewMember>(`/drivers/${id}`);
    return data;
  },

  async update(id: string, input: Partial<Omit<CrewMember, "id" | "isActive">>): Promise<CrewMember> {
    const { data } = await api.patch<CrewMember>(`/drivers/${id}`, input);
    return data;
  },

  async setStatus(id: string, isActive: boolean): Promise<void> {
    await api.patch(`/drivers/${id}/status`, { isActive });
  },
};

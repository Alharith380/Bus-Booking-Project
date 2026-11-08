import type { PageMeta } from "@/types";

export type CrewType = "DRIVER" | "ASSISTANT";

export interface CrewMember {
  id: string;
  fullName: string;
  phone: string;
  licenseNumber?: string;
  crewType: CrewType;
  isActive: boolean;
}

export interface CrewQuery {
  q?: string;
  crewType?: CrewType | "";
  isActive?: boolean | "";
  page?: number;
  limit?: number;
}

export type CrewResult = { crew: CrewMember[]; meta?: PageMeta };

import { api } from "@/lib/api-client";
import type {
  CreateUserInput,
  SystemUser,
  UpdateUserInput,
  UsersQuery,
  UsersResult,
} from "@/features/users/types";

/**
 * خدمات المستخدمين — العقد §3 (ADMIN فقط):
 * GET/POST /users، GET/PATCH /users/:id، PATCH /users/:id/status.
 */
export const usersService = {
  async list(query: UsersQuery = {}): Promise<UsersResult> {
    const { data, meta } = await api.get<SystemUser[]>("/users", {
      role: query.role || undefined,
      q: query.q || undefined,
      isActive: query.isActive === "" ? undefined : query.isActive,
      page: query.page,
      limit: query.limit,
    });
    return { users: data, meta };
  },

  async create(input: CreateUserInput): Promise<SystemUser> {
    const { data } = await api.post<SystemUser>("/users", input);
    return data;
  },

  async update(id: string, input: UpdateUserInput): Promise<SystemUser> {
    const { data } = await api.patch<SystemUser>(`/users/${id}`, input);
    return data;
  },

  async setStatus(id: string, isActive: boolean): Promise<void> {
    await api.patch(`/users/${id}/status`, { isActive });
  },
};

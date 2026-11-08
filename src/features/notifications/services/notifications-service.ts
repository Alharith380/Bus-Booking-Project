import { api } from "@/lib/api-client";
import type { Notification } from "@/features/notifications/types";

export const notificationsService = {
  async list(unread = false): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>("/notifications", { unread: unread || undefined });
    return data;
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },
};

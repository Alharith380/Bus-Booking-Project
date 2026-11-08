import { api } from "@/lib/api-client";
import type { AuditLogsResult, BookingsReportRow, ReportSummary } from "@/features/dashboard/types";

/**
 * خدمات التقارير وسجل العمليات — العقد §13 (ADMIN فقط).
 */
export const dashboardService = {
  /** أعداد وإيرادات إجمالية في فترة */
  async summary(from: string, to: string): Promise<ReportSummary> {
    const { data } = await api.get<ReportSummary>("/reports/summary", { from, to });
    return data;
  },

  /** الحجوزات مجمعة بـ day أو route أو employee */
  async bookingsReport(from: string, to: string, groupBy: "day" | "route" | "employee"): Promise<BookingsReportRow[]> {
    const { data } = await api.get<BookingsReportRow[]>("/reports/bookings", { from, to, groupBy });
    return data;
  },

  /** سجل العمليات */
  async auditLogs(
    query: { userId?: string; entityType?: string; from?: string; to?: string; page?: number } = {},
  ): Promise<AuditLogsResult> {
    const { data, meta } = await api.get<AuditLogsResult["logs"]>("/audit-logs", {
      userId: query.userId,
      entityType: query.entityType,
      from: query.from,
      to: query.to,
      page: query.page,
    });
    return { logs: data, meta };
  },
};

import type { PageMeta } from "@/types";

/** إحصائيات لوحة التحكم — العقد §13 GET /reports/summary */
export interface ReportSummary {
  totalBookings: number;
  confirmed: number;
  cancelled: number;
  expired: number;
  revenue: number;
  occupancyRate: number;
}

/** تقرير الحجوزات المجمّع */
export interface BookingsReportRow {
  key: string;
  label: string;
  count: number;
  revenue: number;
}

/** سجل العمليات — العقد §13 */
export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  user?: { id: string; fullName: string };
  createdAt: string;
}

export type AuditLogsResult = { logs: AuditLog[]; meta?: PageMeta };

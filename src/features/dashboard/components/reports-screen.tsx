"use client";

import { useCallback, useEffect, useState } from "react";
import { dashboardService } from "@/features/dashboard/services/dashboard-service";
import type { AuditLog, BookingsReportRow, ReportSummary } from "@/features/dashboard/types";
import type { PageMeta } from "@/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer, formatPrice } from "@/lib/utils";
import { useDateInput } from "@/hooks/use-date-input";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Metric } from "@/components/ui/metric";
import { Notice } from "@/components/ui/notice";

type GroupBy = "day" | "route" | "employee";

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** التقارير: إيرادات فترة + حجوزات مجمّعة + سجل العمليات */
export function ReportsScreen() {
  const [from, setFrom] = useDateInput("month-start");
  const [to, setTo] = useDateInput("today");
  const [groupBy, setGroupBy] = useState<GroupBy>("day");

  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [rows, setRows] = useState<BookingsReportRow[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsMeta, setLogsMeta] = useState<PageMeta | undefined>(undefined);
  const [logPage, setLogPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!from || !to) return; // لم تحسب الفترة بعد — ننتظرها قبل طلب التقارير
    setLoading(true);
    setError(null);
    try {
      const [summaryResult, bookingsResult, logsResult] = await Promise.all([
        dashboardService.summary(from, to),
        dashboardService.bookingsReport(from, to, groupBy),
        dashboardService.auditLogs({ from, to, page: logPage }),
      ]);
      setSummary(summaryResult);
      setRows(bookingsResult);
      setLogs(logsResult.logs);
      setLogsMeta(logsResult.meta);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل التقارير.");
    } finally {
      setLoading(false);
    }
  }, [from, to, groupBy, logPage]);

  useEffect(() => {
    defer(load);
  }, [load]);

  const rowColumns: Column<BookingsReportRow>[] = [
    { key: "label", label: "التفصيل", render: (row) => row.label },
    { key: "count", label: "عدد الحجوزات", render: (row) => String(row.count) },
    { key: "revenue", label: "الإيراد", render: (row) => formatPrice(row.revenue) },
  ];

  const logColumns: Column<AuditLog>[] = [
    { key: "action", label: "العملية", render: (log) => log.action },
    { key: "entity", label: "الكيان", render: (log) => log.entityType },
    { key: "user", label: "المستخدم", render: (log) => log.user?.fullName ?? "النظام" },
    {
      key: "date",
      label: "التاريخ",
      render: (log) => new Date(log.createdAt).toLocaleString("en-GB"),
    },
  ];

  return (
    <>
      <PageHeading title="التقارير" subtitle="أعداد وإيرادات الحجوزات وسجل عمليات النظام" />

      <div className="filters">
        <Field
          label="من تاريخ"
          type="date"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            setLogPage(1);
          }}
        />
        <Field
          label="إلى تاريخ"
          type="date"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            setLogPage(1);
          }}
        />
        <SelectField
          label="تجميع الحجوزات"
          value={groupBy}
          onChange={(event) => setGroupBy(event.target.value as GroupBy)}
        >
          <option value="day">حسب اليوم</option>
          <option value="route">حسب المسار</option>
          <option value="employee">حسب الموظف</option>
        </SelectField>
      </div>

      {error && (
        <Notice title="تعذّر تحميل التقارير" tone="danger">
          {error}
        </Notice>
      )}

      <div className="metrics">
        <Metric
          label="إجمالي الحجوزات"
          value={loading ? "…" : String(summary?.totalBookings ?? 0)}
          detail={`${summary?.confirmed ?? 0} مؤكدة`}
        />
        <Metric
          label="الإيراد"
          value={loading ? "…" : formatPrice(summary?.revenue ?? 0)}
          detail="إجمالي الفترة المحددة"
        />
        <Metric
          label="الملغاة والمنتهية"
          value={loading ? "…" : String((summary?.cancelled ?? 0) + (summary?.expired ?? 0))}
          detail={`${summary?.cancelled ?? 0} ملغاة · ${summary?.expired ?? 0} منتهية`}
        />
        <Metric
          label="نسبة الإشغال"
          value={loading ? "…" : percent(summary?.occupancyRate ?? 0)}
          detail="من مقاعد الرحلات في الفترة"
        />
      </div>

      <Card title={`الحجوزات — ${rows.length} صفاً مجمّعاً`}>
        <DataTable
          columns={rowColumns}
          rows={rows}
          rowKey={(row) => row.key}
          loading={loading}
          emptyMessage="لا توجد حجوزات في هذه الفترة."
        />
      </Card>

      <Card title="سجل العمليات">
        <DataTable
          columns={logColumns}
          rows={logs}
          rowKey={(log) => log.id}
          loading={loading}
          meta={logsMeta}
          onPageChange={setLogPage}
          emptyMessage="لا توجد عمليات مسجّلة في هذه الفترة."
        />
      </Card>
    </>
  );
}

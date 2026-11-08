"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TRIP_STATUS_LABELS, TRIP_STATUS_TONES } from "@/constants/strings";
import { dashboardService } from "@/features/dashboard/services/dashboard-service";
import type { ReportSummary } from "@/features/dashboard/types";
import { tripsService } from "@/features/trips/services/trips-service";
import type { TripSearchResult } from "@/features/trips/types";
import { ApiRequestError } from "@/lib/api-client";
import { formatDateInput, formatPrice, toDateInputValue } from "@/lib/utils";
import { useDateInput } from "@/hooks/use-date-input";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Metric } from "@/components/ui/metric";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { LoadingState } from "@/components/ui/states";

/** حدود اليوم الحالي بصيغة ISO المطلوبة في تقرير /reports/summary */
function todayRange(): { from: string; to: string; date: string } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString(), date: toDateInputValue(now) };
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/** لوحة الإدارة: مقاييس اليوم + رحلات اليوم + ما يحتاج متابعة */
export function DashboardScreen() {
  const [today] = useDateInput("today");
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { from, to, date } = todayRange();
    let cancelled = false;

    Promise.all([dashboardService.summary(from, to), tripsService.list({ date })])
      .then(([nextSummary, nextTrips]) => {
        if (cancelled) return;
        setSummary(nextSummary);
        setTrips(nextTrips.trips);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError ? err.message : "تعذّر تحميل إحصائيات اليوم.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const columns: Column<TripSearchResult>[] = [
    {
      key: "route",
      label: "الرحلة / المسار",
      render: (trip) => `${trip.origin.name} إلى ${trip.destination.name}`,
    },
    {
      key: "departure",
      label: "المغادرة",
      render: (trip) => new Date(trip.departureDateTime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
    {
      key: "occupancy",
      label: "الإشغال",
      render: (trip) => `${trip.totalSeats - trip.availableSeats} / ${trip.totalSeats}`,
    },
    {
      key: "status",
      label: "الحالة",
      render: (trip) => (
        <Status tone={TRIP_STATUS_TONES[trip.status] ?? "neutral"}>
          {TRIP_STATUS_LABELS[trip.status] ?? trip.status}
        </Status>
      ),
    },
    {
      key: "action",
      label: "الإجراء",
      render: (trip) => <Link href={`/desk/trips/${trip.id}`}>عرض المقاعد</Link>,
    },
  ];

  const waiting = summary ? summary.totalBookings - summary.confirmed - summary.cancelled - summary.expired : 0;
  const confirmedRatio = summary && summary.totalBookings > 0 ? summary.confirmed / summary.totalBookings : 0;

  return (
    <>
      <PageHeading
        title="لوحة التشغيل"
        subtitle={`${today ? formatDateInput(today) : "…"} · متابعة تشغيل الشركة اليوم`}
        action={
          <Link href="/admin/trips/new" className="button button--primary">
            إضافة رحلة
          </Link>
        }
      />

      {error && (
        <Notice title="تعذّر تحميل البيانات" tone="danger">
          {error}
        </Notice>
      )}

      <div className="metrics">
        <Metric
          label="حجوزات اليوم"
          value={loading ? "…" : String(summary?.totalBookings ?? 0)}
          detail={
            summary
              ? `${summary.confirmed} مؤكدة · ${Math.max(0, waiting)} بانتظار الدفع`
              : "في انتظار الخادم"
          }
        />
        <Metric
          label="الإيراد المسجّل"
          value={loading ? "…" : formatPrice(summary?.revenue ?? 0)}
          detail="إجمالي مدفوعات الفترة المحددة"
        />
        <Metric
          label="إشغال المقاعد"
          value={loading ? "…" : percent(summary?.occupancyRate ?? 0)}
          detail="من إجمالي مقاعد الرحلات المطابقة"
        />
        <Metric
          label="رحلات اليوم"
          value={loading ? "…" : String(trips.length)}
          detail={
            trips.filter((trip) => trip.status === "SCHEDULED").length
              ? `${trips.filter((trip) => trip.status === "SCHEDULED").length} مجدولة`
              : "لا رحلات مجدولة"
          }
        />
      </div>

      <div className="content-grid content-grid--aside">
        <div>
          <Card title="رحلات اليوم">
            <DataTable
              columns={columns}
              rows={trips}
              rowKey={(trip) => trip.id}
              loading={loading}
              emptyMessage="لا توجد رحلات مجدولة اليوم."
            />
          </Card>

          <Card title="متابعة التحصيل" className="collection">
            <p>نسبة الحجوزات المؤكدة من إجمالي حجوزات اليوم</p>
            <div>
              <span style={{ width: `${Math.round(confirmedRatio * 1000) / 10}%` }} />
            </div>
            <strong>{percent(confirmedRatio)}</strong>
          </Card>
        </div>

        <div className="stack">
          <Card title="تحتاج إلى متابعتك">
            <Notice title={`${Math.max(0, waiting)} حجوزات غير مؤكدة`}>
              بانتظار قبض المدفوعات النقدية قبل انتهاء مهلة الدفع.
            </Notice>
            <Notice title="تعارض واحد في التوليد" tone="danger">
              راجع نتائج توليد الجدول الأسبوعي لتعيين مركبة بديلة قبل نشر الرحلات.
            </Notice>
          </Card>

          <Card title="إجراءات سريعة">
            <Link href="/admin/trips/schedules" className="button button--outline">
              إنشاء جدول متكرر
            </Link>
            <Link href="/desk/bookings" className="button button--ghost">
              مراجعة الحجوزات المعلّقة
            </Link>
          </Card>
        </div>
      </div>

      {loading && <LoadingState />}
    </>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
} from "@/constants/strings";
import { bookingsService } from "@/features/bookings/services/bookings-service";
import type { Booking } from "@/features/bookings/types";
import type { BookingStatus, PageMeta } from "@/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer, formatPrice } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

const STATUS_OPTIONS: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
  "COMPLETED",
];

interface BookingsScreenProps {
  area?: "admin" | "reception";
}

/** قائمة الحجوزات مع فلاتر الحالة وبحث برقم الحجز */
export function BookingsScreen({ area = "reception" }: BookingsScreenProps) {
  const [status, setStatus] = useState<BookingStatus | "">("");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [reference, setReference] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingsService.list({ status, page });
      setBookings(result.bookings);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الحجوزات.");
    } finally {
      setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    defer(load);
  }, [load]);

  async function searchByReference() {
    const ref = reference.trim();
    if (!ref) {
      setError("أدخل رقم الحجز مثل BK-7F3K2A.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const booking = await bookingsService.byReference(ref);
      setBookings([booking]);
      setMeta(undefined);
      setNotice(`تم العثور على الحجز ${booking.bookingReference}.`);
    } catch (err) {
      setBookings([]);
      setError(err instanceof ApiRequestError ? err.message : "لم يُعثر على حجز بهذا الرقم.");
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<Booking>[] = [
    { key: "ref", label: "رقم الحجز", render: (booking) => booking.bookingReference },
    {
      key: "trip",
      label: "المسار",
      render: (booking) => (booking.trip ? `${booking.trip.origin} ← ${booking.trip.destination}` : "—"),
    },
    {
      key: "seats",
      label: "المقاعد",
      render: (booking) =>
        booking.seats?.length ? booking.seats.map((seat) => seat.seatNumber).join("، ") : "—",
    },
    { key: "total", label: "المبلغ", render: (booking) => formatPrice(booking.totalPrice) },
    {
      key: "status",
      label: "الحالة",
      render: (booking) => (
        <Status tone={BOOKING_STATUS_TONES[booking.status] ?? "neutral"}>
          {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
        </Status>
      ),
    },
    {
      key: "payment",
      label: "الدفع",
      render: (booking) => (
        <Status tone={PAYMENT_STATUS_TONES[booking.paymentStatus] ?? "neutral"}>
          {PAYMENT_STATUS_LABELS[booking.paymentStatus] ?? booking.paymentStatus}
        </Status>
      ),
    },
    {
      key: "actions",
      label: "الإجراء",
      render: (booking) => (
        <span className="row-actions">
          <Link href={`${area === "admin" ? "/admin/bookings" : "/reception/bookings"}/${booking.id}`}>التفاصيل</Link>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title={area === "admin" ? "حجوزات الشركة" : "حجوزاتي في الاستقبال"}
        subtitle={area === "admin" ? "مراقبة حجوزات الشركة حسب الحالة" : "الحجوزات التي أنشأها موظف الاستقبال"}
        action={
          <Link href={area === "admin" ? "/admin/trips" : "/reception/trips"} className="button button--outline">
            حجز جديد
          </Link>
        }
      />

      <div className="filters">
        <SelectField
          label="حالة الحجز"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as BookingStatus | "");
            setPage(1);
          }}
        >
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map((code) => (
            <option key={code} value={code}>
              {BOOKING_STATUS_LABELS[code]}
            </option>
          ))}
        </SelectField>

        <Field
          label="رقم الحجز"
          placeholder="BK-7F3K2A"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />

        <div className="field">
          <span>&nbsp;</span>
          <Button type="button" variant="ghost" onClick={() => void searchByReference()}>
            بحث بالرقم
          </Button>
        </div>
      </div>

      {error && (
        <Notice title="تعذّر إتمام العملية" tone="danger">
          {error}
        </Notice>
      )}
      {notice && (
        <Notice title="نتيجة البحث" tone="info">
          {notice}
        </Notice>
      )}

      <Card title={`${bookings.length} حجز معروض`}>
        <DataTable
          columns={columns}
          rows={bookings}
          rowKey={(booking) => booking.id}
          loading={loading}
          meta={meta}
          onPageChange={setPage}
          emptyMessage="لا توجد حجوزات مطابقة."
        />
      </Card>
    </>
  );
}

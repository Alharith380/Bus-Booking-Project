"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONES,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
} from "@/constants/strings";
import { bookingsService } from "@/features/bookings/services/bookings-service";
import type { BookingDetail, CancelPreview, Ticket } from "@/features/bookings/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer, formatDate, formatPrice, formatTime } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { QrCode } from "@/components/shared/qr-code";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

interface PassengerRow {
  seatId: string;
  seatNumber: string;
  passengerName: string;
  passengerPhone?: string;
  seatPrice: number;
  boardingStatus: "NOT_BOARDED" | "BOARDED";
}

/** تفاصيل الحجز: المسافرون + التذكرة + الدفع النقدي + الإلغاء والإيصال */
export function BookingDetailScreen() {
  const params = useParams<{ id: string }>();
  const bookingId = params.id;

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [preview, setPreview] = useState<CancelPreview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const detail = await bookingsService.getById(bookingId);
      setBooking(detail);
      setAmount(detail.totalPrice);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الحجز.");
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    defer(load);
  }, [load]);

  async function loadTicket() {
    setError(null);
    try {
      setTicket(await bookingsService.getTicket(bookingId));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل التذكرة.");
    }
  }

  async function loadReceipt() {
    setError(null);
    try {
      setReceipt(await bookingsService.getReceipt(bookingId));
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الإيصال.");
    }
  }

  async function pay() {
    if (!booking) return;
    setError(null);
    setNotice(null);
    if (amount <= 0) {
      setError("أدخل مبلغاً صحيحاً.");
      return;
    }
    setBusy(true);
    try {
      const updated = await bookingsService.pay(bookingId, { amount: Number(amount), method: "CASH" });
      setBooking((prev) => (prev ? { ...prev, ...updated } : prev));
      setNotice(
        updated.paymentStatus === "PAID"
          ? "تم قبض المبلغ وتأكيد الحجز."
          : "تم تسجيل دفعة جزئية؛ يبقى الحجز بانتظار اكتمال المبلغ.",
      );
      setPreview(null);
      setReason("");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تسجيل الدفع.");
    } finally {
      setBusy(false);
    }
  }

  async function previewCancel() {
    setError(null);
    if (!reason.trim()) {
      setError("اكتب سبب الإلغاء.");
      return;
    }
    try {
      const result = await bookingsService.cancel(bookingId, {
        reason: reason.trim(),
        confirm: false,
      });
      setPreview(result as CancelPreview);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر معاينة الإلغاء.");
    }
  }

  async function confirmCancel() {
    setError(null);
    setBusy(true);
    try {
      await bookingsService.cancel(bookingId, { reason: reason.trim(), confirm: true });
      setNotice("تم إلغاء الحجز وتحرير المقاعد.");
      setPreview(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر إلغاء الحجز.");
    } finally {
      setBusy(false);
    }
  }

  const passengers: PassengerRow[] = booking?.passengers ?? [];
  const passengerColumns: Column<PassengerRow>[] = [
    { key: "seat", label: "المقعد", render: (row) => row.seatNumber },
    { key: "name", label: "الراكب", render: (row) => row.passengerName },
    { key: "phone", label: "الهاتف", render: (row) => row.passengerPhone || "—" },
    { key: "price", label: "السعر", render: (row) => formatPrice(row.seatPrice) },
    {
      key: "boarding",
      label: "الصعود",
      render: (row) => (
        <Status tone={row.boardingStatus === "BOARDED" ? "success" : "neutral"}>
          {row.boardingStatus === "BOARDED" ? "صعد" : "لم يصعد"}
        </Status>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title={booking ? `حجز ${booking.bookingReference}` : "تفاصيل الحجز"}
        subtitle={
          booking
            ? `${booking.trip ? `${booking.trip.origin} ← ${booking.trip.destination}` : "بيانات الرحلة"} · ${formatDate(booking.trip?.departureDateTime ?? booking.createdAt ?? new Date().toISOString())}`
            : "جارٍ التحميل…"
        }
        action={
          <Link href="/desk/bookings" className="button button--outline">
            عودة للقائمة
          </Link>
        }
      />

      {error && (
        <Notice title="تعذّر إتمام العملية" tone="danger">
          {error}
        </Notice>
      )}
      {notice && (
        <Notice title="تم التنفيذ" tone="info">
          {notice}
        </Notice>
      )}

      {loading && <div className="loading-state">جارٍ تحميل الحجز…</div>}

      {booking && (
        <div className="content-grid content-grid--aside">
          <div className="stack">
            <Card title="بيانات الحجز">
              <div className="city-tags" style={{ marginBottom: 14 }}>
                <Status tone={BOOKING_STATUS_TONES[booking.status] ?? "neutral"}>
                  {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}
                </Status>
                <Status tone={PAYMENT_STATUS_TONES[booking.paymentStatus] ?? "neutral"}>
                  {PAYMENT_STATUS_LABELS[booking.paymentStatus] ?? booking.paymentStatus}
                </Status>
                <Status tone="info">الإجمالي {formatPrice(booking.totalPrice)}</Status>
              </div>

              <dl className="access-state" style={{ textAlign: "right", margin: 0 }}>
                <div>
                  <dt>الرحلة</dt>
                  <dd>
                    {booking.trip
                      ? `${booking.trip.origin} ← ${booking.trip.destination}`
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt>موعد المغادرة</dt>
                  <dd>
                    {booking.trip
                      ? `${formatDate(booking.trip.departureDateTime)} · ${formatTime(booking.trip.departureDateTime)}`
                      : "—"}
                  </dd>
                </div>
                {booking.expiresAt && (
                  <div>
                    <dt>مهلة الدفع</dt>
                    <dd>{formatTime(booking.expiresAt)}</dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card title="المسافرون">
              <DataTable
                columns={passengerColumns}
                rows={passengers}
                rowKey={(row) => row.seatId}
                emptyMessage="لا يوجد مسافرون مسجّلون على هذا الحجز."
              />
            </Card>

            <Card title="التذكرة الإلكترونية">
              <div className="city-tags" style={{ alignItems: "center" }}>
                <QrCode value={ticket?.qrPayload ?? booking.bookingReference} />
                <div>
                  <p className="caption">
                    {ticket
                      ? "الرمز مولّد من نص الخادم الموقّع دون تعديل، ويُستعمل في فحص الصعود."
                      : "اضغط «توليد التذكرة» لجلب النص الموقّع من الخادم."}
                  </p>
                  <Button type="button" variant="ghost" onClick={() => void loadTicket()}>
                    توليد التذكرة
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="stack">
            <Card title="الدفع النقدي" className="form-card">
              <Field
                label="المبلغ المستلم بالليرة السورية"
                type="number"
                min={0}
                step={1000}
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
              <p className="caption">
                عند اكتمال المبلغ يصبح الحجز مؤكد؛ المبلغ الأقل يسجَّل دفعة جزئية.
              </p>
              <Button
                type="button"
                onClick={() => void pay()}
                disabled={busy || booking.paymentStatus === "PAID"}
              >
                {busy ? "جارٍ التسجيل…" : "تسجيل الدفع وتأكيد الحجز"}
              </Button>
            </Card>

            <Card title="إلغاء الحجز" className="form-card">
              <Field
                label="سبب الإلغاء"
                placeholder="تغيرت الخطة"
                value={reason}
                onChange={(event) => {
                  setReason(event.target.value);
                  setPreview(null);
                }}
              />

              {!preview && (
                <Button type="button" variant="ghost" onClick={() => void previewCancel()}>
                  معاينة الاسترداد
                </Button>
              )}

              {preview && (
                <Notice
                  title={preview.allowed ? "الإلغاء مسموح" : "لا يسمح الإلغاء"}
                  tone={preview.allowed ? "warning" : "danger"}
                >
                  استرداد {formatPrice(preview.refundAmount)} بنسبة {preview.refundPercent}% من
                  قيمة الحجز.
                </Notice>
              )}

              {preview?.allowed && (
                <Button type="button" onClick={() => void confirmCancel()} disabled={busy}>
                  تأكيد الإلغاء
                </Button>
              )}
            </Card>

            <Card title="الإيصال للطباعة" className="form-card">
              {!receipt && (
                <Button type="button" variant="outline" onClick={() => void loadReceipt()}>
                  تحميل بيانات الإيصال
                </Button>
              )}
              {receipt && (
                <>
                  <dl className="access-state" style={{ textAlign: "right", margin: 0 }}>
                    {Object.entries(receipt).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{typeof value === "object" ? JSON.stringify(value) : String(value)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="actions">
                    <Button type="button" onClick={() => window.print()}>
                      طباعة الإيصال
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setReceipt(null)}>
                      إخفاء
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

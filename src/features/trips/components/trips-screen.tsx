"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TRIP_STATUS_LABELS, TRIP_STATUS_TONES } from "@/constants/strings";
import { tripsService } from "@/features/trips/services/trips-service";
import type { TripSearchResult } from "@/features/trips/types";
import type { PageMeta, TripStatus } from "@/types";
import { ApiRequestError } from "@/lib/api-client";
import { useDebounce } from "@/hooks/use-debounce";
import { defer, formatPrice, formatTimeRange } from "@/lib/utils";
import { useDateInput } from "@/hooks/use-date-input";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

const STATUS_OPTIONS: TripStatus[] = ["SCHEDULED", "CANCELLED", "COMPLETED"];

function toIso(local: string): string {
  return new Date(local).toISOString();
}

function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface EditForm {
  departureDateTime: string;
  arrivalDateTime: string;
  price: number;
}

/** إدارة الرحلات: فلاتر + جدول + تعديل وإلغاء رحلة واحدة */
export function TripsScreen() {
  const [date, setDate] = useDateInput("today");
  const [status, setStatus] = useState<TripStatus | "">("");
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [selected, setSelected] = useState<TripSearchResult | null>(null);
  const [form, setForm] = useState<EditForm>({ departureDateTime: "", arrivalDateTime: "", price: 0 });
  const [cancelReason, setCancelReason] = useState("");
  const [cancelPreview, setCancelPreview] = useState<{ affectedBookings: number } | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    if (!date) return; // لم يحسب تاريخ اليوم بعد — ننتظره قبل طلب القائمة
    setLoading(true);
    setError(null);
    try {
      const result = await tripsService.list({ date, status, page });
      setTrips(result.trips);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الرحلات.");
    } finally {
      setLoading(false);
    }
  }, [date, status, page]);

  useEffect(() => {
    defer(load);
  }, [load]);

  function startEdit(trip: TripSearchResult) {
    setSelected(trip);
    setForm({
      departureDateTime: toLocalInput(trip.departureDateTime),
      arrivalDateTime: toLocalInput(trip.arrivalDateTime),
      price: trip.price,
    });
    setCancelReason("");
    setCancelPreview(null);
    setNotice(null);
  }

  function resetForm() {
    setSelected(null);
    setCancelReason("");
    setCancelPreview(null);
    setNotice(null);
  }

  async function save() {
    if (!selected) return;
    setError(null);
    setNotice(null);
    try {
      await tripsService.update(selected.id, {
        departureDateTime: toIso(form.departureDateTime),
        arrivalDateTime: toIso(form.arrivalDateTime),
        price: Number(form.price),
      });
      setNotice("تم حفظ تعديلات الرحلة. السعر المحفوظ في الحجوزات السابقة لا يتغيّر.");
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر حفظ الرحلة.");
    }
  }

  async function previewCancel() {
    if (!selected || !cancelReason.trim()) {
      setError("اكتب سبب الإلغاء أولاً.");
      return;
    }
    setError(null);
    try {
      const result = await tripsService.cancel(selected.id, {
        reason: cancelReason.trim(),
        confirm: false,
      });
      setCancelPreview({ affectedBookings: result.affectedBookings });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر معاينة الإلغاء.");
    }
  }

  async function confirmCancel() {
    if (!selected) return;
    setError(null);
    try {
      const result = await tripsService.cancel(selected.id, {
        reason: cancelReason.trim(),
        confirm: true,
      });
      setNotice(`تم إلغاء الرحلة وإشعار ${result.notified ?? result.affectedBookings} حجز.`);
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر إلغاء الرحلة.");
    }
  }

  async function completeTrip() {
    if (!selected) return;
    setError(null);
    try {
      await tripsService.complete(selected.id);
      setNotice("تم إنهاء الرحلة وتحويل حجوزاتها المؤكدة إلى مكتملة.");
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر إنهاء الرحلة.");
    }
  }

  const keyword = debouncedSearch.trim();
  const visibleTrips = keyword
    ? trips.filter((trip) =>
        `${trip.origin.name} ${trip.destination.name} ${trip.bus.busName} ${trip.bus.busType}`
          .toLowerCase()
          .includes(keyword.toLowerCase()),
      )
    : trips;

  const columns: Column<TripSearchResult>[] = [
    {
      key: "route",
      label: "المسار",
      render: (trip) => `${trip.origin.name} إلى ${trip.destination.name}`,
    },
    {
      key: "time",
      label: "مغادرة ← وصول",
      render: (trip) => formatTimeRange(trip.departureDateTime, trip.arrivalDateTime),
    },
    { key: "bus", label: "المركبة", render: (trip) => trip.bus.busName },
    {
      key: "occupancy",
      label: "الإشغال",
      render: (trip) => `${trip.totalSeats - trip.availableSeats} / ${trip.totalSeats}`,
    },
    { key: "price", label: "سعر المقعد", render: (trip) => formatPrice(trip.price) },
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
      key: "actions",
      label: "الإجراءات",
      render: (trip) => (
        <span className="row-actions">
          <Link href={`/desk/trips/${trip.id}`}>مقاعد</Link>
          <button type="button" onClick={() => startEdit(trip)}>
            تعديل
          </button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="الرحلات"
        subtitle="إدارة الرحلات المفردة والمولّدة من الجداول المتكررة"
        action={
          <Link href="/admin/trips/new" className="button button--primary">
            إنشاء رحلة
          </Link>
        }
      />

      <div className="filters">
        <Field
          label="تاريخ المغادرة"
          type="date"
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setPage(1);
          }}
        />
        <SelectField
          label="حالة الرحلة"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as TripStatus | "");
            setPage(1);
          }}
        >
          <option value="">كل الحالات</option>
          {STATUS_OPTIONS.map((code) => (
            <option key={code} value={code}>
              {TRIP_STATUS_LABELS[code]}
            </option>
          ))}
        </SelectField>
        <Field
          label="بحث في المسار أو المركبة"
          placeholder="دمشق، بولمان 01…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

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

      <Card title={`${visibleTrips.length} رحلة مطابقة للفلاتر`}>
        <DataTable
          columns={columns}
          rows={visibleTrips}
          rowKey={(trip) => trip.id}
          loading={loading}
          meta={meta}
          onPageChange={setPage}
          emptyMessage="لا توجد رحلات في هذا التاريخ."
        />
      </Card>

      <p className="caption">
        التعرفة الجديدة تطبق على الحجوزات الجديدة فقط. تعديل رحلة لا يغيّر الأسعار المثبتة مسبقاً.
      </p>

      {selected && (
        <Card title={`تعديل الرحلة · ${selected.origin.name} إلى ${selected.destination.name}`} className="form-card">
          <div className="form-row">
            <Field
              label="المغادرة"
              type="datetime-local"
              value={form.departureDateTime}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, departureDateTime: event.target.value }))
              }
            />
            <Field
              label="الوصول"
              type="datetime-local"
              value={form.arrivalDateTime}
              onChange={(event) => setForm((prev) => ({ ...prev, arrivalDateTime: event.target.value }))}
            />
          </div>
          <Field
            label="سعر المقعد بالليرة السورية"
            type="number"
            min={0}
            step={1000}
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
          />

          <div className="actions">
            <Button type="button" onClick={() => void save()}>
              حفظ التعديلات
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              تراجع
            </Button>
          </div>

          <Field
            label="سبب الإلغاء"
            placeholder="عطل في البولمان"
            value={cancelReason}
            onChange={(event) => {
              setCancelReason(event.target.value);
              setCancelPreview(null);
            }}
          />

          {!cancelPreview && (
            <Button type="button" variant="ghost" onClick={() => void previewCancel()}>
              معاينة أثر الإلغاء
            </Button>
          )}

          {cancelPreview && (
            <Notice title={`ستتأثر ${cancelPreview.affectedBookings} حجزاً`} tone="danger">
              سيُلغى الحجز ويُشعر أصحابه. أعد التأكيد لتنفيذ الإلغاء نهائياً.
            </Notice>
          )}

          {cancelPreview && (
            <div className="actions">
              <Button type="button" onClick={() => void confirmCancel()}>
                تأكيد الإلغاء
              </Button>
              <Button type="button" variant="outline" onClick={() => setCancelPreview(null)}>
                تراجع
              </Button>
            </div>
          )}

          <Button type="button" variant="ghost" onClick={() => void completeTrip()}>
            إنهاء الرحلة يدوياً
          </Button>
        </Card>
      )}
    </>
  );
}

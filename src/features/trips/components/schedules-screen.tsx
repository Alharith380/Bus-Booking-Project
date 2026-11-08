"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fleetService } from "@/features/fleet/services/fleet-service";
import { linesService } from "@/features/lines/services/lines-service";
import { tripsService } from "@/features/trips/services/trips-service";
import type { Schedule, ScheduleGenerationResult } from "@/features/trips/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer, formatDuration } from "@/lib/utils";
import { useDateInput } from "@/hooks/use-date-input";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

type RecurrenceType = "DAILY" | "WEEKLY" | "MONTHLY";

const WEEK_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

interface Option {
  id: string;
  label: string;
}

interface ScheduleForm {
  routeId: string;
  busId: string;
  departureTime: string;
  durationMinutes: number;
  type: RecurrenceType;
  daysOfWeek: number[];
  endDate: string;
  price: number;
}

const EMPTY_FORM: ScheduleForm = {
  routeId: "",
  busId: "",
  departureTime: "08:00",
  durationMinutes: 300,
  type: "WEEKLY",
  daysOfWeek: [0, 3, 6],
  endDate: "",
  price: 0,
};

function describe(schedule: Schedule): string {
  const rule = schedule.recurrenceRule;
  if (rule.type === "DAILY") return "يومياً";
  if (rule.type === "MONTHLY") return "شهرياً";
  return `أسبوعياً · ${(rule.daysOfWeek ?? []).map((day) => WEEK_DAYS[day]).join("، ")}`;
}

/** الجداول المتكررة: إنشاء قالب زمني + معاينة التعارضات + توليد الرحلات */
export function SchedulesScreen() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [routes, setRoutes] = useState<Option[]>([]);
  const [buses, setBuses] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ScheduleForm>(EMPTY_FORM);
  const [startDate, setStartDate] = useDateInput("today");
  const [rangeFrom, setRangeFrom] = useDateInput("today");
  const [rangeTo, setRangeTo] = useState("");
  const [result, setResult] = useState<ScheduleGenerationResult | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schedulesResult, routesResult, busesResult] = await Promise.all([
        tripsService.listSchedules(),
        linesService.listRoutes(),
        fleetService.listBuses("ACTIVE"),
      ]);
      setSchedules(schedulesResult);
      setRoutes(
        routesResult.routes
          .filter((route) => route.isActive)
          .map((route) => ({
            id: route.id,
            label: `${route.origin?.name ?? "…"} ← ${route.destination?.name ?? "…"}`,
          })),
      );
      setBuses(
        busesResult.buses.map((bus) => ({ id: bus.id, label: `${bus.busName} · ${bus.plateNumber}` })),
      );
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الجداول.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    defer(load);
  }, [load]);

  function toggleDay(day: number) {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((value) => value !== day)
        : [...prev.daysOfWeek, day].sort((a, b) => a - b),
    }));
  }

  async function submit() {
    setError(null);
    setNotice(null);
    setResult(null);

    if (!form.routeId || !form.busId) {
      setError("اختر المسار والمركبة.");
      return;
    }
    if (form.type === "WEEKLY" && form.daysOfWeek.length === 0) {
      setError("اختر يوماً واحداً على الأقل.");
      return;
    }
    if (!startDate || !form.endDate) {
      setError("حدّد تاريخي البداية والنهاية.");
      return;
    }
    if (form.price <= 0) {
      setError("أدخل سعراً صحيحاً للمقعد.");
      return;
    }

    setSaving(true);
    try {
      await tripsService.createSchedule({
        routeId: form.routeId,
        busId: form.busId,
        departureTime: form.departureTime,
        durationMinutes: Number(form.durationMinutes),
        recurrenceRule:
          form.type === "WEEKLY"
            ? { type: "WEEKLY", daysOfWeek: form.daysOfWeek }
            : { type: form.type },
        startDate,
        endDate: form.endDate,
        price: Number(form.price),
      });
      setNotice("تم إنشاء الجدول المتكرر. راجع المعاينة قبل التوليد.");
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر إنشاء الجدول.");
    } finally {
      setSaving(false);
    }
  }

  async function runGeneration(schedule: Schedule, mode: "preview" | "generate") {
    setError(null);
    setNotice(null);
    setResult(null);

    if (!rangeFrom || !rangeTo) {
      setError("حدّد نطاق التوليد من تاريخ إلى تاريخ.");
      return;
    }

    const range = { from: rangeFrom, to: rangeTo };
    try {
      const output =
        mode === "preview"
          ? await tripsService.previewSchedule(schedule.id, range)
          : await tripsService.generateSchedule(schedule.id, range);
      setResult(output);
      if (mode === "generate") {
        setNotice(`تم إنشاء ${(output.created ?? []).length} رحلة من الجدول.`);
        await load();
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تنفيذ العملية.");
    }
  }

  async function toggleStatus(schedule: Schedule) {
    setError(null);
    setNotice(null);
    try {
      await tripsService.setScheduleStatus(schedule.id, !schedule.isActive);
      setNotice(schedule.isActive ? "تم إيقاف الجدول." : "تم تفعيل الجدول.");
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تغيير حالة الجدول.");
    }
  }

  const columns: Column<Schedule>[] = [
    { key: "route", label: "المسار", render: (schedule) => routes.find((route) => route.id === schedule.routeId)?.label ?? schedule.routeId },
    {
      key: "rule",
      label: "التكرار",
      render: (schedule) => describe(schedule),
    },
    {
      key: "time",
      label: "الموعد",
      render: (schedule) => `${schedule.departureTime} · ${formatDuration(schedule.durationMinutes)}`,
    },
    {
      key: "range",
      label: "الفترة",
      render: (schedule) => `${schedule.startDate} ← ${schedule.endDate}`,
    },
    {
      key: "status",
      label: "الحالة",
      render: (schedule) => (
        <Status tone={schedule.isActive ? "success" : "neutral"}>
          {schedule.isActive ? "مفعّل" : "موقوف"}
        </Status>
      ),
    },
    {
      key: "actions",
      label: "الإجراءات",
      render: (schedule) => (
        <span className="row-actions">
          <button type="button" onClick={() => void toggleStatus(schedule)}>
            {schedule.isActive ? "إيقاف" : "تفعيل"}
          </button>
          <button type="button" onClick={() => void runGeneration(schedule, "preview")}>
            معاينة
          </button>
          <button type="button" onClick={() => void runGeneration(schedule, "generate")}>
            توليد
          </button>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="الجداول المتكررة"
        subtitle="قالب زمني يعيد إنتاج رحلات متماثلة مع فحص التعارض قبل التوليد"
        action={
          <Link href="/admin/trips" className="button button--outline">
            عودة إلى الرحلات
          </Link>
        }
      />

      <div className="content-grid content-grid--form">
        <div>
          <Card title="نطاق التوليد" className="form-card">
            <div className="form-row">
              <Field
                label="من تاريخ"
                type="date"
                value={rangeFrom}
                onChange={(event) => setRangeFrom(event.target.value)}
              />
              <Field
                label="إلى تاريخ"
                type="date"
                value={rangeTo}
                onChange={(event) => setRangeTo(event.target.value)}
              />
            </div>
            <p className="caption">
              «معاينة» لا تكتب شيئاً؛ «توليد» ينشئ الرحلات الفعلية ويعرض المكرر والتعارض.
            </p>
          </Card>

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

          {result && (
            <Notice
              title={
                (result.conflicts?.length ?? 0) > 0
                  ? `${result.conflicts.length} تعارض يحتاج معالجة`
                  : "لا تعارضات في النطاق"
              }
              tone={(result.conflicts?.length ?? 0) > 0 ? "danger" : "info"}
            >
              {(result.willCreate ?? result.created ?? []).length} رحلة سيتم إنشاؤها ·{" "}
              {result.skippedDuplicates.length} مكرر سيُتخطى ·{" "}
              {result.conflicts.length} تعارض ({result.conflicts.map((item) => item.reason).join("، ") ||
                "لا شيء"}).
            </Notice>
          )}

          <Card title={`${schedules.length} جدول متكرر`}>
            <DataTable
              columns={columns}
              rows={schedules}
              rowKey={(schedule) => schedule.id}
              loading={loading}
              emptyMessage="لا توجد جداول متكررة بعد."
            />
          </Card>
        </div>

        <Card title="جدول جديد" className="form-card">
          <SelectField
            label="المسار"
            value={form.routeId}
            onChange={(event) => setForm((prev) => ({ ...prev, routeId: event.target.value }))}
          >
            <option value="">اختر المسار</option>
            {routes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="المركبة"
            value={form.busId}
            onChange={(event) => setForm((prev) => ({ ...prev, busId: event.target.value }))}
          >
            <option value="">اختر الحافلة</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.label}
              </option>
            ))}
          </SelectField>

          <div className="form-row">
            <Field
              label="وقت المغادرة"
              type="time"
              value={form.departureTime}
              onChange={(event) => setForm((prev) => ({ ...prev, departureTime: event.target.value }))}
            />
            <Field
              label="المدة بالدقائق"
              type="number"
              min={15}
              step={15}
              value={form.durationMinutes}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, durationMinutes: Number(event.target.value) || 0 }))
              }
            />
          </div>

          <SelectField
            label="نوع التكرار"
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, type: event.target.value as RecurrenceType }))
            }
          >
            <option value="DAILY">يومياً</option>
            <option value="WEEKLY">أسبوعياً</option>
            <option value="MONTHLY">شهرياً</option>
          </SelectField>

          {form.type === "WEEKLY" && (
            <div>
              <span className="field" style={{ marginBottom: 6 }}>
                أيام الأسبوع
              </span>
              <div className="city-tags">
                {WEEK_DAYS.map((label, day) => (
                  <button
                    key={label}
                    type="button"
                    className="chip-toggle"
                    aria-pressed={form.daysOfWeek.includes(day)}
                    onClick={() => toggleDay(day)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-row">
            <Field
              label="من تاريخ"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <Field
              label="إلى تاريخ"
              type="date"
              value={form.endDate}
              onChange={(event) => setForm((prev) => ({ ...prev, endDate: event.target.value }))}
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

          <p className="caption">
            يُنسخ الموعد والسعر إلى كل رحلة مولَّدة. تعارض الطاقم يظهر ضمن النتائج.
          </p>

          <div className="actions">
            <Button type="button" onClick={() => void submit()} disabled={saving}>
              {saving ? "جارٍ الحفظ…" : "إنشاء الجدول"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setForm(EMPTY_FORM)}>
              تراجع
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}

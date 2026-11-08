"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fleetService } from "@/features/fleet/services/fleet-service";
import { linesService } from "@/features/lines/services/lines-service";
import { tripsService } from "@/features/trips/services/trips-service";
import type { CreateTripInput } from "@/features/trips/types";
import { ApiRequestError } from "@/lib/api-client";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

interface Option {
  id: string;
  label: string;
}

function toIso(local: string): string {
  return new Date(local).toISOString();
}

/** إنشاء رحلة طارئة واحدة خارج الجداول المتكررة */
export function NewTripScreen() {
  const router = useRouter();

  const [routes, setRoutes] = useState<Option[]>([]);
  const [buses, setBuses] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    routeId: "",
    busId: "",
    departureDateTime: "",
    arrivalDateTime: "",
    price: 0,
  });

  useEffect(() => {
    let cancelled = false;

    Promise.all([linesService.listRoutes(), fleetService.listBuses("ACTIVE")])
      .then(([routesResult, busesResult]) => {
        if (cancelled) return;
        setRoutes(
          routesResult.routes
            .filter((route) => route.isActive)
            .map((route) => ({
              id: route.id,
              label: `${route.origin?.name ?? "…"} ← ${route.destination?.name ?? "…"}`,
            })),
        );
        setBuses(
          busesResult.buses.map((bus) => ({
            id: bus.id,
            label: `${bus.busName} · ${bus.plateNumber}`,
          })),
        );
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof ApiRequestError ? err.message : "تعذّر تحميل المسارات والحافلات.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function submit() {
    setError(null);

    if (!form.routeId || !form.busId || !form.departureDateTime || !form.arrivalDateTime) {
      setError("أكمل المسار والمركبة وموعدَي المغادرة والوصول.");
      return;
    }
    if (form.price <= 0) {
      setError("أدخل سعراً صحيحاً للمقعد.");
      return;
    }
    if (new Date(form.arrivalDateTime) <= new Date(form.departureDateTime)) {
      setError("موعد الوصول يجب أن يكون بعد المغادرة.");
      return;
    }

    setSaving(true);
    try {
      const payload: CreateTripInput = {
        routeId: form.routeId,
        busId: form.busId,
        departureDateTime: toIso(form.departureDateTime),
        arrivalDateTime: toIso(form.arrivalDateTime),
        price: Number(form.price),
      };
      const trip = await tripsService.create(payload);
      router.push(`/desk/trips/${trip.id}`);
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "تعذّر إنشاء الرحلة، حاول مجدداً.",
      );
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeading
        title="إنشاء رحلة"
        subtitle="رحلة مفردة تُضاف إلى قائمة التشغيل مباشرة"
        action={
          <Link href="/admin/trips" className="button button--outline">
            عودة إلى الرحلات
          </Link>
        }
      />

      <div className="content-grid content-grid--form">
        <Card title="بيانات الرحلة" className="form-card">
          <SelectField
            label="المسار"
            value={form.routeId}
            disabled={loading}
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
            disabled={loading}
            onChange={(event) => setForm((prev) => ({ ...prev, busId: event.target.value }))}
          >
            <option value="">اختر حافلة جاهزة</option>
            {buses.map((bus) => (
              <option key={bus.id} value={bus.id}>
                {bus.label}
              </option>
            ))}
          </SelectField>

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
              onChange={(event) =>
                setForm((prev) => ({ ...prev, arrivalDateTime: event.target.value }))
              }
            />
          </div>

          <Field
            label="سعر المقعد بالليرة السورية"
            type="number"
            min={0}
            step={1000}
            placeholder="45000"
            value={form.price}
            onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
          />

          {error && (
            <Notice title="تعذّر إنشاء الرحلة" tone="danger">
              {error}
            </Notice>
          )}

          <div className="actions">
            <Button type="button" onClick={() => void submit()} disabled={saving}>
              {saving ? "جارٍ الإنشاء…" : "إنشاء الرحلة"}
            </Button>
            <Link href="/admin/trips" className="button button--outline">
              إلغاء
            </Link>
          </div>
        </Card>

        <div className="stack">
          <Notice title="تعارض المركبة" tone="info">
            لا تسمح النظام بتعيين حافلة لرحلة متداخلة زمنياً؛ يظهر الخطأ BUS_CONFLICT مع تفاصيل
            الرحلة المتعارضة.
          </Notice>
          <Notice title="الطاقم اختياري">
            يمكن إسناد السائق والمساعد لاحقاً من تعديل الرحلة. لا يُربط سائق معطّل برحلة.
          </Notice>
        </div>
      </div>
    </>
  );
}

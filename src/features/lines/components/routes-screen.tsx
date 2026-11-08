"use client";

import { useCallback, useEffect, useState } from "react";
import { linesService } from "@/features/lines/services/lines-service";
import type { City, Route } from "@/features/lines/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

export function RoutesScreen() {
  const [cities, setCities] = useState<City[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [form, setForm] = useState({ originCityId: "", destinationCityId: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cityList, routeList] = await Promise.all([linesService.listCities(), linesService.listRoutes()]);
      setCities(cityList);
      setRoutes(routeList.routes);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل المسارات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    defer(load);
  }, [load]);

  async function create() {
    if (!form.originCityId || !form.destinationCityId || form.originCityId === form.destinationCityId) {
      setError("اختر مدينتين مختلفتين.");
      return;
    }
    try {
      await linesService.createRoute({ ...form, description: form.description.trim() || undefined });
      setForm({ originCityId: "", destinationCityId: "", description: "" });
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر إضافة المسار.");
    }
  }

  const cityName = (id: string) => cities.find((city) => city.id === id)?.name || "—";
  const columns: Column<Route>[] = [
    { key: "origin", label: "الانطلاق", render: (route) => route.origin?.name || cityName(route.originCityId) },
    { key: "destination", label: "الوصول", render: (route) => route.destination?.name || cityName(route.destinationCityId) },
    { key: "description", label: "الوصف", render: (route) => route.description || "—" },
    { key: "status", label: "الحالة", render: (route) => <Status tone={route.isActive ? "success" : "neutral"}>{route.isActive ? "نشط" : "موقوف"}</Status> },
  ];

  return (
    <>
      <PageHeading title="المسارات" subtitle="تعريف اتجاهات الرحلات بين المدن" />
      <div className="content-grid content-grid--form">
        <Card title="إضافة مسار" className="form-card">
          <SelectField label="مدينة الانطلاق" value={form.originCityId} onChange={(event) => setForm((prev) => ({ ...prev, originCityId: event.target.value }))}>
            <option value="">اختر المدينة</option>
            {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </SelectField>
          <SelectField label="مدينة الوصول" value={form.destinationCityId} onChange={(event) => setForm((prev) => ({ ...prev, destinationCityId: event.target.value }))}>
            <option value="">اختر المدينة</option>
            {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
          </SelectField>
          <Field label="الوصف (اختياري)" value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} />
          <Button type="button" onClick={() => void create()}>إضافة المسار</Button>
          {error && <Notice title="تعذّر التنفيذ" tone="danger">{error}</Notice>}
        </Card>
        <Card title={`${routes.length} مسار`}>
          <DataTable columns={columns} rows={routes} rowKey={(route) => route.id} loading={loading} emptyMessage="لا توجد مسارات." />
        </Card>
      </div>
    </>
  );
}

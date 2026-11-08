"use client";

import { useCallback, useEffect, useState } from "react";
import { linesService } from "@/features/lines/services/lines-service";
import type { City } from "@/features/lines/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

export function CitiesScreen() {
  const [cities, setCities] = useState<City[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCities(await linesService.listCities());
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل المدن.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    defer(load);
  }, [load]);

  async function create() {
    if (!name.trim() || !code.trim()) {
      setError("أدخل اسم المدينة ورمزها.");
      return;
    }
    try {
      await linesService.createCity({ name: name.trim(), code: code.trim() });
      setName("");
      setCode("");
      setNotice("تمت إضافة المدينة.");
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّرت إضافة المدينة.");
    }
  }

  async function toggle(city: City) {
    try {
      await linesService.updateCity(city.id, { isActive: !city.isActive });
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تغيير حالة المدينة.");
    }
  }

  const columns: Column<City>[] = [
    { key: "name", label: "المدينة", render: (city) => city.name },
    { key: "code", label: "الرمز", render: (city) => city.code || "—" },
    { key: "status", label: "الحالة", render: (city) => <Status tone={city.isActive ? "success" : "neutral"}>{city.isActive ? "نشطة" : "موقوفة"}</Status> },
    { key: "actions", label: "إجراء", render: (city) => <button type="button" onClick={() => void toggle(city)}>{city.isActive ? "إيقاف" : "تفعيل"}</button> },
  ];

  return (
    <>
      <PageHeading title="المدن" subtitle="إدارة المدن الفعّالة في شبكة الرحلات" />
      <div className="content-grid content-grid--form">
        <Card title="إضافة مدينة" className="form-card">
          <Field label="اسم المدينة" value={name} onChange={(event) => setName(event.target.value)} />
          <Field label="الرمز" value={code} onChange={(event) => setCode(event.target.value)} />
          <Button type="button" onClick={() => void create()}>إضافة</Button>
          {error && <Notice title="تعذّر التنفيذ" tone="danger">{error}</Notice>}
          {notice && <Notice title="تم التنفيذ" tone="info">{notice}</Notice>}
        </Card>
        <Card title={`${cities.length} مدينة`}>
          <DataTable columns={columns} rows={cities} rowKey={(city) => city.id} loading={loading} emptyMessage="لا توجد مدن." />
        </Card>
      </div>
    </>
  );
}

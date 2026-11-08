"use client";

import { useCallback, useEffect, useState } from "react";
import { fleetService } from "@/features/fleet/services/fleet-service";
import type { BusType } from "@/features/fleet/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

export function BusTypesManagementScreen() {
  const [types, setTypes] = useState<BusType[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setTypes(await fleetService.listBusTypes());
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل أنواع الحافلات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    defer(load);
  }, [load]);

  async function create() {
    if (!name.trim()) {
      setError("أدخل اسم النوع.");
      return;
    }
    try {
      await fleetService.createBusType({ name: name.trim(), description: description.trim() || undefined });
      setName("");
      setDescription("");
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر إنشاء النوع.");
    }
  }

  const columns: Column<BusType>[] = [
    { key: "name", label: "النوع", render: (type) => type.name },
    { key: "description", label: "الوصف", render: (type) => type.description || "—" },
    { key: "status", label: "الحالة", render: (type) => type.isActive === false ? "موقوف" : "نشط" },
  ];

  return (
    <>
      <PageHeading title="أنواع الحافلات" subtitle="تعريف الأنواع قبل إنشاء مخططات المقاعد" />
      <div className="content-grid content-grid--form">
        <Card title="إضافة نوع" className="form-card">
          <Field label="اسم النوع" value={name} onChange={(event) => setName(event.target.value)} />
          <Field label="الوصف (اختياري)" value={description} onChange={(event) => setDescription(event.target.value)} />
          <Button type="button" onClick={() => void create()}>إضافة النوع</Button>
          {error && <Notice title="تعذّر التنفيذ" tone="danger">{error}</Notice>}
        </Card>
        <Card title={`${types.length} نوع`}>
          <DataTable columns={columns} rows={types} rowKey={(type) => type.id} loading={loading} emptyMessage="لا توجد أنواع." />
        </Card>
      </div>
    </>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { crewService } from "@/features/crew/services/crew-service";
import type { CrewMember, CrewType } from "@/features/crew/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

export function CrewScreen() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [type, setType] = useState<CrewType | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({ fullName: "", phone: "", licenseNumber: "", crewType: "DRIVER" as CrewType });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await crewService.list({ crewType: type });
      setCrew(result.crew);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الطاقم.");
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    defer(load);
  }, [load]);

  async function create() {
    setError(null);
    setNotice(null);
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError("أدخل اسم الموظف ورقم الهاتف.");
      return;
    }
    try {
      await crewService.create({
        ...form,
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        licenseNumber: form.licenseNumber.trim() || undefined,
      });
      setForm({ fullName: "", phone: "", licenseNumber: "", crewType: "DRIVER" });
      setNotice("تمت إضافة فرد الطاقم.");
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّرت إضافة فرد الطاقم.");
    }
  }

  async function toggle(member: CrewMember) {
    try {
      await crewService.setStatus(member.id, !member.isActive);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تغيير الحالة.");
    }
  }

  const columns: Column<CrewMember>[] = [
    { key: "name", label: "الاسم", render: (member) => member.fullName },
    { key: "phone", label: "الهاتف", render: (member) => member.phone },
    { key: "type", label: "النوع", render: (member) => (member.crewType === "DRIVER" ? "سائق" : "مساعد") },
    { key: "license", label: "الرخصة", render: (member) => member.licenseNumber || "—" },
    {
      key: "status",
      label: "الحالة",
      render: (member) => <Status tone={member.isActive ? "success" : "neutral"}>{member.isActive ? "نشط" : "غير نشط"}</Status>,
    },
    {
      key: "actions",
      label: "إجراء",
      render: (member) => <button type="button" onClick={() => void toggle(member)}>{member.isActive ? "تعطيل" : "تفعيل"}</button>,
    },
  ];

  return (
    <>
      <PageHeading title="السائقون والمساعدون" subtitle="إدارة أفراد الطاقم وربطهم بالرحلات" />
      <div className="content-grid content-grid--form">
        <div>
          <SelectField label="نوع الطاقم" value={type} onChange={(event) => setType(event.target.value as CrewType | "")}>
            <option value="">الكل</option>
            <option value="DRIVER">سائقون</option>
            <option value="ASSISTANT">مساعدون</option>
          </SelectField>
          <DataTable columns={columns} rows={crew} rowKey={(member) => member.id} loading={loading} emptyMessage="لا يوجد طاقم مطابق." />
        </div>
        <Card title="إضافة فرد طاقم" className="form-card">
          <Field label="الاسم" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
          <Field label="الهاتف" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          <Field label="رقم الرخصة (اختياري)" value={form.licenseNumber} onChange={(event) => setForm((prev) => ({ ...prev, licenseNumber: event.target.value }))} />
          <SelectField label="النوع" value={form.crewType} onChange={(event) => setForm((prev) => ({ ...prev, crewType: event.target.value as CrewType }))}>
            <option value="DRIVER">سائق</option>
            <option value="ASSISTANT">مساعد</option>
          </SelectField>
          <Button type="button" onClick={() => void create()}>إضافة</Button>
          {error && <Notice title="تعذّر التنفيذ" tone="danger">{error}</Notice>}
          {notice && <Notice title="تم التنفيذ" tone="info">{notice}</Notice>}
        </Card>
      </div>
    </>
  );
}

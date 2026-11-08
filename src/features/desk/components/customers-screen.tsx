"use client";

import { useState } from "react";
import { deskService } from "@/features/desk/services/desk-service";
import type { Customer } from "@/features/desk/types";
import { ApiRequestError } from "@/lib/api-client";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

export function CustomersScreen() {
  const [phone, setPhone] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [form, setForm] = useState({ fullName: "", phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function search() {
    if (!phone.trim()) {
      setError("أدخل رقم هاتف للبحث.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await deskService.searchCustomers(phone.trim());
      setCustomers(result.customers);
      setForm((prev) => ({ ...prev, phone: phone.trim() }));
    } catch (err) {
      setCustomers([]);
      setError(err instanceof ApiRequestError ? err.message : "تعذّر البحث عن الزبون.");
    } finally {
      setLoading(false);
    }
  }

  async function create() {
    if (!form.fullName.trim() || !form.phone.trim()) {
      setError("أدخل اسم الزبون ورقم هاتفه.");
      return;
    }
    setError(null);
    try {
      const customer = await deskService.createCustomer({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
      });
      setCustomers([customer]);
      setNotice("تم إنشاء حساب الزبون.");
      setForm({ fullName: "", phone: form.phone, email: "" });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر إنشاء الزبون.");
    }
  }

  const columns: Column<Customer>[] = [
    { key: "name", label: "الاسم", render: (customer) => customer.fullName },
    { key: "phone", label: "الهاتف", render: (customer) => customer.phone },
    { key: "email", label: "البريد", render: (customer) => customer.email || "—" },
  ];

  return (
    <>
      <PageHeading title="الزبائن" subtitle="البحث عن زبون وإنشاء حساب جديد من الشباك" />
      <div className="filters">
        <Field label="رقم الهاتف" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <div className="field">
          <span>&nbsp;</span>
          <Button type="button" onClick={() => void search()} disabled={loading}>
            {loading ? "جارٍ البحث…" : "بحث"}
          </Button>
        </div>
      </div>
      {error && <Notice title="تعذّر التنفيذ" tone="danger">{error}</Notice>}
      {notice && <Notice title="تم التنفيذ" tone="info">{notice}</Notice>}
      <div className="content-grid content-grid--form">
        <Card title="نتائج البحث">
          <DataTable columns={columns} rows={customers} rowKey={(customer) => customer.id} loading={loading} emptyMessage="لا يوجد زبون مطابق." />
        </Card>
        <Card title="إنشاء زبون" className="form-card">
          <Field label="الاسم الكامل" value={form.fullName} onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))} />
          <Field label="رقم الهاتف" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
          <Field label="البريد (اختياري)" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
          <Button type="button" onClick={() => void create()}>إنشاء الزبون</Button>
        </Card>
      </div>
    </>
  );
}

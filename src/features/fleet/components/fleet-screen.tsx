"use client";

import { useCallback, useEffect, useState } from "react";
import { BUS_STATUS_LABELS, BUS_STATUS_TONES } from "@/constants/strings";
import { fleetService } from "@/features/fleet/services/fleet-service";
import type { Bus, BusInput } from "@/features/fleet/types";
import type { BusStatus } from "@/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Metric } from "@/components/ui/metric";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

const STATUS_OPTIONS: BusStatus[] = ["ACTIVE", "MAINTENANCE", "INACTIVE"];

const EMPTY_FORM: BusInput = {
  busTypeId: "",
  seatLayoutId: "",
  plateNumber: "",
  busName: "",
};

/** إدارة أسطول الحافلات: مقاييس الجاهزية + قائمة + نموذج إضافة وتعديل */
export function FleetScreen() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busTypes, setBusTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [layouts, setLayouts] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<Bus | null>(null);
  const [status, setStatus] = useState<BusStatus>("ACTIVE");
  const [form, setForm] = useState<BusInput>(EMPTY_FORM);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [busesResult, typesResult, layoutsResult] = await Promise.all([
        fleetService.listBuses(),
        fleetService.listBusTypes(),
        fleetService.listSeatLayouts(),
      ]);
      setBuses(busesResult.buses);
      setBusTypes(typesResult);
      setLayouts(layoutsResult);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الأسطول.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    defer(load);
  }, [load]);

  function startCreate() {
    setCreating(true);
    setSelected(null);
    setForm(EMPTY_FORM);
    setStatus("ACTIVE");
    setNotice(null);
  }

  function startEdit(bus: Bus) {
    setCreating(false);
    setSelected(bus);
    setForm({
      busTypeId: bus.busTypeId,
      seatLayoutId: bus.seatLayoutId,
      plateNumber: bus.plateNumber,
      busName: bus.busName,
    });
    setStatus(bus.status);
    setNotice(null);
  }

  function resetForm() {
    setCreating(false);
    setSelected(null);
    setForm(EMPTY_FORM);
    setStatus("ACTIVE");
    setNotice(null);
  }

  async function submit() {
    setError(null);
    setNotice(null);

    if (!form.busTypeId || !form.seatLayoutId || !form.plateNumber.trim() || !form.busName.trim()) {
      setError("أكمل اللوحة والاسم والنوع ومخطط المقاعد.");
      return;
    }

    try {
      if (creating) {
        await fleetService.createBus({
          ...form,
          plateNumber: form.plateNumber.trim(),
          busName: form.busName.trim(),
        });
        setNotice("تمت إضافة الحافلة إلى الأسطول.");
      } else if (selected) {
        await fleetService.updateBus(selected.id, {
          ...form,
          plateNumber: form.plateNumber.trim(),
          busName: form.busName.trim(),
        });
        if (status !== selected.status) {
          await fleetService.setBusStatus(selected.id, status);
        }
        setNotice("تم حفظ بيانات الحافلة.");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر حفظ الحافلة.");
    }
  }

  const columns: Column<Bus>[] = [
    {
      key: "bus",
      label: "المركبة / اللوحة",
      render: (bus) => `${bus.busName} · ${bus.plateNumber}`,
    },
    { key: "type", label: "النوع", render: (bus) => bus.busType?.name ?? "—" },
    {
      key: "status",
      label: "الحالة",
      render: (bus) => (
        <Status tone={BUS_STATUS_TONES[bus.status] ?? "neutral"}>
          {BUS_STATUS_LABELS[bus.status] ?? bus.status}
        </Status>
      ),
    },
    {
      key: "actions",
      label: "إجراءات",
      render: (bus) => (
        <span className="row-actions">
          <button type="button" onClick={() => startEdit(bus)}>
            تعديل
          </button>
        </span>
      ),
    },
  ];

  const count = (code: BusStatus) => buses.filter((bus) => bus.status === code).length;

  return (
    <>
      <PageHeading
        title="أسطول الحافلات"
        subtitle="المركبات والجاهزية التشغيلية · اربط كل مركبة بمخطط مقاعد معتمد"
        action={
          <Button type="button" onClick={startCreate} disabled={creating}>
            إضافة حافلة
          </Button>
        }
      />

      <div className="metrics">
        <Metric label="إجمالي المركبات" value={String(buses.length)} detail="ضمن الشركة الحالية" />
        <Metric
          label="جاهزة للتشغيل"
          value={loading ? "…" : String(count("ACTIVE"))}
          detail="متاحة للتعيين على الرحلات"
        />
        <Metric
          label="في الصيانة"
          value={loading ? "…" : String(count("MAINTENANCE"))}
          detail="غير متاحة للتعيين"
        />
        <Metric
          label="غير نشطة"
          value={loading ? "…" : String(count("INACTIVE"))}
          detail="مستبعدة من الرحلات الجديدة"
        />
      </div>

      <div className="content-grid content-grid--form">
        <div>
          <DataTable
            columns={columns}
            rows={buses}
            rowKey={(bus) => bus.id}
            loading={loading}
            emptyMessage="لا توجد مركبات في الأسطول بعد."
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
        </div>

        <Card
          title={creating ? "إضافة حافلة" : selected ? `تعديل ${selected.busName}` : "تعديل حافلة"}
          className="form-card"
        >
          {!creating && !selected && <p className="caption">اختر حافلة من الجدول لعرض بياناتها.</p>}

          {(creating || selected) && (
            <>
              <Field
                label="رقم اللوحة"
                placeholder="ش-123456"
                value={form.plateNumber}
                onChange={(event) => setForm((prev) => ({ ...prev, plateNumber: event.target.value }))}
              />
              <Field
                label="الاسم الداخلي"
                placeholder="بولمان 01"
                value={form.busName}
                onChange={(event) => setForm((prev) => ({ ...prev, busName: event.target.value }))}
              />
              <SelectField
                label="نوع البولمان"
                value={form.busTypeId}
                onChange={(event) => setForm((prev) => ({ ...prev, busTypeId: event.target.value }))}
              >
                <option value="">اختر النوع</option>
                {busTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="مخطط المقاعد"
                value={form.seatLayoutId}
                onChange={(event) => setForm((prev) => ({ ...prev, seatLayoutId: event.target.value }))}
              >
                <option value="">اختر المخطط</option>
                {layouts.map((layout) => (
                  <option key={layout.id} value={layout.id}>
                    {layout.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="الحالة التشغيلية"
                value={status}
                onChange={(event) => setStatus(event.target.value as BusStatus)}
              >
                {STATUS_OPTIONS.map((code) => (
                  <option key={code} value={code}>
                    {BUS_STATUS_LABELS[code]}
                  </option>
                ))}
              </SelectField>

              <Notice title="الربط النهائي قيد المراجعة">
                اعتمد مخطط المقاعد في صفحة «أنواع الحافلات» قبل أول رحلة فعلية.
              </Notice>

              <div className="actions">
                <Button type="button" onClick={() => void submit()}>
                  {creating ? "إضافة الحافلة" : "حفظ الحافلة"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  إلغاء
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

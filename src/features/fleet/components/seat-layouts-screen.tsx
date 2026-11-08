"use client";

import { useCallback, useEffect, useState } from "react";
import { fleetService } from "@/features/fleet/services/fleet-service";
import type { BusType, SeatLayout } from "@/features/fleet/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

export function SeatLayoutsScreen() {
  const [layouts, setLayouts] = useState<SeatLayout[]>([]);
  const [types, setTypes] = useState<BusType[]>([]);
  const [selected, setSelected] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [layoutList, typeList] = await Promise.all([fleetService.listSeatLayouts(), fleetService.listBusTypes()]);
      setLayouts(layoutList);
      setTypes(typeList);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل المخططات.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    defer(load);
  }, [load]);

  const typeName = (id?: string) => types.find((type) => type.id === id)?.name || "—";
  const columns: Column<SeatLayout>[] = [
    { key: "name", label: "المخطط", render: (layout) => layout.name },
    { key: "type", label: "النوع", render: (layout) => typeName(layout.busTypeId) },
    { key: "capacity", label: "السعة", render: (layout) => `${layout.totalSeats} مقعد` },
    { key: "status", label: "الحالة", render: () => <Status tone="info">جاهز للربط</Status> },
    { key: "action", label: "إجراء", render: (layout) => <button type="button" onClick={() => void fleetService.getSeatLayout(layout.id).then(setSelected).catch(() => setError("تعذّر عرض المخطط."))}>عرض المقاعد</button> },
  ];

  return (
    <>
      <PageHeading title="مخططات المقاعد" subtitle="استعراض المخططات المولّدة وربطها بالحافلات" />
      {error && <Notice title="تعذّر تحميل المخططات" tone="danger">{error}</Notice>}
      <div className="content-grid content-grid--form">
        <Card title={`${layouts.length} مخطط`}>
          <DataTable columns={columns} rows={layouts} rowKey={(layout) => layout.id} loading={loading} emptyMessage="لا توجد مخططات." />
        </Card>
        <Card title={selected ? selected.name : "تفاصيل المخطط"}>
          {selected ? (
            <div className="seat-grid">
              {(selected.seats ?? []).map((seat) => <span key={seat.id} className={seat.isActive ? "" : "state--inactive"}>{seat.seatNumber}</span>)}
            </div>
          ) : <p className="caption">اختر مخططاً لعرض المقاعد.</p>}
        </Card>
      </div>
    </>
  );
}

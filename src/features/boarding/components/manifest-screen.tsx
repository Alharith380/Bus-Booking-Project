"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { boardingService } from "@/features/boarding/services/boarding-service";
import type { BoardingManifest } from "@/features/boarding/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

export function ManifestScreen() {
  const params = useParams<{ id: string }>();
  const [manifest, setManifest] = useState<BoardingManifest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    defer(async () => {
      try {
        setManifest(await boardingService.manifest(params.id));
      } catch (err) {
        setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل كشف الركاب.");
      }
    });
  }, [params.id]);

  const columns: Column<BoardingManifest["passengers"][number]>[] = [
    { key: "reference", label: "الحجز", render: (passenger) => passenger.bookingReference },
    { key: "name", label: "الراكب", render: (passenger) => passenger.passengerName },
    { key: "seat", label: "المقعد", render: (passenger) => passenger.seatNumber },
    {
      key: "status",
      label: "الصعود",
      render: (passenger) => <Status tone={passenger.boardingStatus === "BOARDED" ? "success" : "neutral"}>{passenger.boardingStatus === "BOARDED" ? "صعد" : "لم يصعد"}</Status>,
    },
  ];

  return (
    <>
      <PageHeading title="كشف ركاب الرحلة" subtitle={manifest ? `صعد ${manifest.boarded} من ${manifest.totalPassengers}` : "جارٍ التحميل…"} />
      {error && <Notice title="تعذّر تحميل الكشف" tone="danger">{error}</Notice>}
      <DataTable columns={columns} rows={manifest?.passengers ?? []} rowKey={(passenger) => `${passenger.bookingId}-${passenger.seatId}`} loading={!manifest && !error} emptyMessage="لا يوجد ركاب." />
    </>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { linesService } from "@/features/lines/services/lines-service";
import type { City } from "@/features/lines/types";
import { tripsService } from "@/features/trips/services/trips-service";
import type { TripSearchResult } from "@/features/trips/types";
import { ApiRequestError } from "@/lib/api-client";
import { formatPrice, formatTimeRange } from "@/lib/utils";
import { useDateInput } from "@/hooks/use-date-input";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

/** البحث عن رحلة متاحة من الشباك ثم الانتقال إلى اختيار المقاعد */
export function DeskSearchScreen() {
  const [cities, setCities] = useState<City[]>([]);
  const [originCityId, setOriginCityId] = useState("");
  const [destinationCityId, setDestinationCityId] = useState("");
  const [date, setDate] = useDateInput("today");

  const [trips, setTrips] = useState<TripSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    linesService
      .listCities()
      .then((result) => {
        if (!cancelled) setCities(result.filter((city) => city.isActive));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل المدن.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function search() {
    setError(null);
    if (!originCityId || !destinationCityId) {
      setError("اختر مدينة الانطلاق ومدينة الوصول.");
      return;
    }
    if (originCityId === destinationCityId) {
      setError("اختر مدينتين مختلفتين.");
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const result = await tripsService.search({ originCityId, destinationCityId, date });
      setTrips(result);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر البحث عن رحلات.");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<TripSearchResult>[] = [
    {
      key: "route",
      label: "المسار",
      render: (trip) => `${trip.origin.name} ← ${trip.destination.name}`,
    },
    {
      key: "time",
      label: "مغادرة ← وصول",
      render: (trip) => formatTimeRange(trip.departureDateTime, trip.arrivalDateTime),
    },
    { key: "bus", label: "الحافلة", render: (trip) => trip.bus.busName },
    { key: "price", label: "سعر المقعد", render: (trip) => formatPrice(trip.price) },
    {
      key: "seats",
      label: "المقاعد المتاحة",
      render: (trip) => (
        <Status tone={trip.availableSeats > 0 ? "success" : "neutral"}>
          {trip.availableSeats} من {trip.totalSeats}
        </Status>
      ),
    },
    {
      key: "action",
      label: "الإجراء",
      render: (trip) => (
        <span className="row-actions">
          <Link href={`/desk/trips/${trip.id}`}>اختيار المقاعد</Link>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="البحث والحجز"
        subtitle="ابحث عن رحلة متاحة ثم احجز مقاعدها للزبون الحاضر"
      />

      <div className="filters">
        <SelectField
          label="من مدينة"
          value={originCityId}
          onChange={(event) => setOriginCityId(event.target.value)}
        >
          <option value="">اختر المدينة</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="إلى مدينة"
          value={destinationCityId}
          onChange={(event) => setDestinationCityId(event.target.value)}
        >
          <option value="">اختر المدينة</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </SelectField>

        <Field
          label="تاريخ المغادرة"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />

        <div className="field">
          <span>&nbsp;</span>
          <Button type="button" onClick={() => void search()} disabled={loading}>
            {loading ? "جارٍ البحث…" : "بحث عن رحلات"}
          </Button>
        </div>
      </div>

      {error && (
        <Notice title="تعذّر البحث" tone="danger">
          {error}
        </Notice>
      )}

      <Card title={searched ? `${trips.length} رحلة متاحة` : "نتائج البحث"}>
        <DataTable
          columns={columns}
          rows={trips}
          rowKey={(trip) => trip.id}
          loading={loading}
          emptyMessage={
            searched
              ? "لا توجد رحلات متاحة على هذا المسار في التاريخ المحدد."
              : "اختر المسار والتاريخ ثم اضغط بحث."
          }
        />
      </Card>
    </>
  );
}

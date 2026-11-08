"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deskService } from "@/features/desk/services/desk-service";
import type { Customer, Hold, PassengerInput, CreatedBooking } from "@/features/desk/types";
import { tripsService } from "@/features/trips/services/trips-service";
import type { TripDetail, TripSeat } from "@/features/trips/types";
import { ApiRequestError } from "@/lib/api-client";
import { hasPermission } from "@/lib/permissions";
import { useAuth } from "@/hooks/use-auth";
import { defer, formatPrice, formatTimeRange } from "@/lib/utils";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";
import { SeatPlan, type SeatPlanItem, type SeatPlanState } from "@/features/fleet/components/seat-plan";

const COLUMN_ORDER: Record<TripSeat["columnPosition"], number> = {
  LEFT_WINDOW: 0,
  LEFT_INNER: 1,
  AISLE: 2,
  RIGHT_INNER: 3,
  RIGHT_WINDOW: 4,
};

function mapState(seat: TripSeat): SeatPlanState {
  if (seat.isActive === false) return "inactive";
  if (seat.state === "BOOKED") return "booked";
  if (seat.state === "HELD" && !seat.heldByMe) return "held";
  return "available";
}

function secondsLeft(iso: string): number {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

function countdown(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

interface PassengerForm {
  name: string;
  phone: string;
}

/** تفاصيل الرحلة: اختيار المقاعد ثم احتجاز ثم إنشاء الحجز */
export function TripBookingScreen() {
  const params = useParams<{ tripId: string }>();
  const tripId = params.tripId;
  const { user } = useAuth();

  const canHold = hasPermission(user?.role ?? null, "holds");

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [seats, setSeats] = useState<TripSeat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [hold, setHold] = useState<Hold | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [busy, setBusy] = useState(false);

  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [passengers, setPassengers] = useState<Record<string, PassengerForm>>({});

  const [created, setCreated] = useState<CreatedBooking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tripResult, seatsResult] = await Promise.all([
        tripsService.getById(tripId),
        tripsService.getSeats(tripId),
      ]);
      setTrip(tripResult);
      setSeats(seatsResult.seats);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل الرحلة.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    defer(load);
  }, [load]);

  useEffect(() => {
    if (!hold) return;
    const timer = setInterval(() => setRemaining(secondsLeft(hold.expiresAt)), 1000);
    return () => clearInterval(timer);
  }, [hold]);

  const sortedSeats = useMemo(
    () =>
      [...seats].sort(
        (a, b) =>
          a.rowNumber - b.rowNumber ||
          COLUMN_ORDER[a.columnPosition] - COLUMN_ORDER[b.columnPosition],
      ),
    [seats],
  );

  const planItems: SeatPlanItem[] = sortedSeats.map((seat) => ({
    key: seat.seatId,
    number: seat.seatNumber,
    state: mapState(seat),
  }));

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggleSeat(seatId: string) {
    if (hold) return; // المقاعد مثبّتة بعد الاحتجاز
    setSelected((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId],
    );
    setNotice(null);
  }

  async function createHold() {
    setError(null);
    setNotice(null);
    if (selected.length === 0) {
      setError("اختر مقعداً واحداً على الأقل.");
      return;
    }
    setBusy(true);
    try {
      const nextHold = await deskService.createHold(tripId, selected);
      setHold(nextHold);
      setRemaining(secondsLeft(nextHold.expiresAt));
      setPassengers(
        Object.fromEntries(selected.map((seatId) => [seatId, { name: "", phone: "" }])),
      );
      await refreshSeats();
    } catch (err) {
      setError(
        err instanceof ApiRequestError
          ? `${err.message} — الاحتجاز كله أو لا شيء، جرّب إزالة المقعد المزعج.`
          : "تعذّر احتجاز المقاعد.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function refreshSeats() {
    try {
      const result = await tripsService.getSeats(tripId);
      setSeats(result.seats);
    } catch {
      /* نترك الحالة الحالية عند تعذّر التحديث */
    }
  }

  async function releaseHold() {
    if (!hold) return;
    setBusy(true);
    setError(null);
    try {
      await deskService.releaseHold(hold.holdId);
      setHold(null);
      setSelected([]);
      setPassengers({});
      await refreshSeats();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحرير المقاعد.");
    } finally {
      setBusy(false);
    }
  }

  async function searchCustomer() {
    setError(null);
    setNotice(null);
    if (!customerPhone.trim()) {
      setError("أدخل رقم هاتف الزبون.");
      return;
    }
    try {
      const result = await deskService.searchCustomers(customerPhone.trim());
      const found = result.customers[0];
      if (found) {
        setCustomer(found);
        setCustomerName(found.fullName);
        setNotice(`تم العثور على الزبون ${found.fullName}.`);
      } else {
        setCustomer(null);
        setNotice("لا يوجد زبون بهذا الرقم — أدخل الاسم لإنشاء حساب جديد.");
      }
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر البحث عن الزبون.");
    }
  }

  async function submitBooking() {
    setError(null);
    setNotice(null);

    if (!hold) {
      setError("احتجز المقاعد أولاً.");
      return;
    }
    if (!customer && !customerName.trim()) {
      setError("أدخل اسم الزبون لإنشاء حسابه أو ابحث برقم هاتفه.");
      return;
    }
    if (selected.some((seatId) => !passengers[seatId]?.name.trim())) {
      setError("أدخل اسم الراكب لكل مقعد.");
      return;
    }

    setBusy(true);
    try {
      let customerId = customer?.id;

      if (!customerId) {
        const createdCustomer = await deskService.createCustomer({
          fullName: customerName.trim(),
          phone: customerPhone.trim(),
        });
        customerId = createdCustomer.id;
        setCustomer(createdCustomer);
      }

      const passengerList: PassengerInput[] = selected.map((seatId) => ({
        seatId,
        passengerName: passengers[seatId].name.trim(),
        passengerPhone: passengers[seatId].phone.trim() || undefined,
      }));

      const booking = await deskService.createBooking({
        tripId,
        holdId: hold.holdId,
        customerId,
        passengers: passengerList,
      });

      setCreated(booking);
      setHold(null);
      setSelected([]);
      await refreshSeats();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "تعذّر إنشاء الحجز، حاول مجدداً.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (created) {
    return (
      <>
        <PageHeading
          title="تم إنشاء الحجز"
          subtitle="راجع البيانات ثم انتقل إلى الدفع أو طباعة التذكرة"
        />
        <Card title={`رقم الحجز ${created.bookingReference}`}>
          <dl className="access-state" style={{ textAlign: "right", margin: 0 }}>
            <div>
              <dt>الحالة</dt>
              <dd>{created.status}</dd>
            </div>
            <div>
              <dt>المبلغ الكلي</dt>
              <dd>{formatPrice(created.totalPrice)}</dd>
            </div>
          </dl>
          <div className="actions">
            <Link href={`/desk/bookings/${created.id}`} className="button button--primary">
              فتح الحجز والدفع
            </Link>
            <Link href="/desk" className="button button--outline">
              حجز جديد
            </Link>
          </div>
        </Card>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeading
          title={trip ? `${trip.origin.name} ← ${trip.destination.name}` : "تفاصيل الرحلة"}
          subtitle="جارٍ تحميل الرحلة وحالة المقاعد…"
          action={
            <Link href="/desk" className="button button--outline">
              عودة للبحث
            </Link>
          }
        />
        <div className="loading-state">جارٍ تحميل المقاعد…</div>
      </>
    );
  }

  return (
    <>
      <PageHeading
        title={trip ? `${trip.origin.name} ← ${trip.destination.name}` : "تفاصيل الرحلة"}
        subtitle={
          trip
            ? `${formatTimeRange(trip.departureDateTime, trip.arrivalDateTime)} · ${trip.bus.busName} · ${formatPrice(trip.price)} للمقعد`
            : "جارٍ التحميل…"
        }
        action={
          <Link href="/desk" className="button button--outline">
            عودة للبحث
          </Link>
        }
      />

      {error && (
        <Notice title="تعذّر إتمام العملية" tone="danger">
          {error}
        </Notice>
      )}
      {notice && (
        <Notice title="معلومة" tone="info">
          {notice}
        </Notice>
      )}

      {!canHold && (
        <Notice title="الحجز غير متاح لهذا الدور" tone="warning">
          احتجاز المقاعد وإنشاء الحجوزات من صلاحيات موظف الاستقبال. يمكنك متابعة كشف المقاعد فقط.
        </Notice>
      )}

      {hold && (
        <Notice title={`المقاعد محتجزة — تبقى ${countdown(remaining)}`} tone="warning">
          أكمل بيانات الزبون والركاب قبل انتهاء المهلة؛ عند الانتهاء تُحرَّر المقاعد تلقائياً.
        </Notice>
      )}

      <div className="content-grid content-grid--seat">
        <SeatPlan
          title="مقاعد الرحلة"
          caption={
            trip
              ? `${trip.totalSeats} مقعداً · ${trip.availableSeats} متاح · ${selected.length} محدد`
              : "جارٍ تحميل المقاعد…"
          }
          badge={<Status tone={trip && trip.availableSeats > 0 ? "success" : "neutral"}>
            {trip && trip.availableSeats > 0 ? "يتوفر مقاعد" : "لا مقاعد متاحة"}
          </Status>}
          seats={planItems}
          selectedKeys={selectedSet}
          onSelect={toggleSeat}
        />

        <div className="stack">
          {!hold && (
            <Card title="الخطوة 1 · احجز المقاعد" className="form-card">
              <p className="caption">
                اضغط المقاعد في المخطط لتحديدها، ثم احجزها لتثبيتها عشر دقائق.
              </p>
              <Button
                type="button"
                onClick={() => void createHold()}
                disabled={busy || !canHold || selected.length === 0}
              >
                {busy ? "جارٍ الاحتجاز…" : `احتجاز ${selected.length} مقعد`}
              </Button>
            </Card>
          )}

          {hold && (
            <Card title="الخطوة 2 · بيانات الحجز" className="form-card">
              <div className="form-row">
                <Field
                  label="هاتف الزبون"
                  type="tel"
                  inputMode="tel"
                  placeholder="09xxxxxxxx"
                  value={customerPhone}
                  onChange={(event) => setCustomerPhone(event.target.value)}
                />
                <div className="field">
                  <span>&nbsp;</span>
                  <Button type="button" variant="ghost" onClick={() => void searchCustomer()}>
                    بحث
                  </Button>
                </div>
              </div>

              <Field
                label="اسم الزبون"
                value={customerName}
                placeholder="الاسم الكامل"
                onChange={(event) => {
                  setCustomerName(event.target.value);
                  setCustomer(null);
                }}
              />

              {selected.map((seatId) => {
                const seat = seats.find((item) => item.seatId === seatId);
                const form = passengers[seatId] ?? { name: "", phone: "" };
                return (
                  <div key={seatId} className="form-row">
                    <Field
                      label={`راكب المقعد ${seat?.seatNumber ?? ""}`}
                      value={form.name}
                      placeholder="الاسم الكامل"
                      onChange={(event) =>
                        setPassengers((prev) => ({
                          ...prev,
                          [seatId]: { ...form, name: event.target.value },
                        }))
                      }
                    />
                    <Field
                      label="هاتف الراكب"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      placeholder="اختياري"
                      onChange={(event) =>
                        setPassengers((prev) => ({
                          ...prev,
                          [seatId]: { ...form, phone: event.target.value },
                        }))
                      }
                    />
                  </div>
                );
              })}

              <p className="caption">
                إجمالي المبلغ: {formatPrice((trip?.price ?? 0) * selected.length)} · السعر يُحفظ
                وقت الحجز.
              </p>

              <div className="actions">
                <Button type="button" onClick={() => void submitBooking()} disabled={busy}>
                  {busy ? "جارٍ الإنشاء…" : "إنشاء الحجز"}
                </Button>
                <Button type="button" variant="outline" onClick={() => void releaseHold()} disabled={busy}>
                  تحرير المقاعد
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

import { Suspense } from "react";
import { TripBookingScreen } from "@/features/desk/components/trip-booking-screen";

export default function NewReceptionBookingPage() {
  return (
    <Suspense fallback={<div className="loading-state">جارٍ تحميل مسار الحجز…</div>}>
      <TripBookingScreen />
    </Suspense>
  );
}

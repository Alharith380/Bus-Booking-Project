import { Suspense } from "react";
import { TripBookingScreen } from "@/features/desk/components/trip-booking-screen";

export default function ReceptionTripPage() {
  return (
    <Suspense fallback={<div className="loading-state">جارٍ تحميل الرحلة…</div>}>
      <TripBookingScreen />
    </Suspense>
  );
}

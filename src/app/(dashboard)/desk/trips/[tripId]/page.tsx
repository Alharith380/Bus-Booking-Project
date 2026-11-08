import { Suspense } from "react";
import { TripBookingScreen } from "@/features/desk/components/trip-booking-screen";

/**
 * تفاصيل الرحلة واختيار المقاعد.
 * الشاشة تقرأ معرّف الرحلة من الرابط، وتأخذها خلف Suspense فلا تدخل في الهيكل الساكن.
 */
export default function TripBookingPage() {
  return (
    <Suspense fallback={<div className="loading-state">جارٍ تحميل الرحلة…</div>}>
      <TripBookingScreen />
    </Suspense>
  );
}

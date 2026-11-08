import { Suspense } from "react";
import { BookingDetailScreen } from "@/features/bookings/components/booking-detail-screen";

/**
 * تفاصيل الحجز.
 * الشاشة تقرأ معرّف الحجز من الرابط، وتأخذها خلف Suspense فلا تدخل في الهيكل الساكن.
 */
export default function BookingDetailPage() {
  return (
    <Suspense fallback={<div className="loading-state">جارٍ تحميل الحجز…</div>}>
      <BookingDetailScreen />
    </Suspense>
  );
}

import { Suspense } from "react";
import { BookingDetailScreen } from "@/features/bookings/components/booking-detail-screen";

export default function AdminBookingDetailPage() {
  return (
    <Suspense fallback={<div className="loading-state">جارٍ تحميل الحجز…</div>}>
      <BookingDetailScreen />
    </Suspense>
  );
}

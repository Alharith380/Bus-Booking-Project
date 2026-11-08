import { Suspense } from "react";
import { ManifestScreen } from "@/features/boarding/components/manifest-screen";

export default function TripManifestPage() {
  return (
    <Suspense fallback={<div className="loading-state">جارٍ تحميل كشف الركاب…</div>}>
      <ManifestScreen />
    </Suspense>
  );
}

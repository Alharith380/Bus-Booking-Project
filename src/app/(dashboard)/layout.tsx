import type { ReactNode } from "react";
import { AdminShell } from "@/components/shared/admin-shell";
import { AuthGuard } from "@/components/shared/auth-guard";

/** تخطيط موحّد لكل صفحات الإدارة والشباك: تحقق من الجلسة ثم هيكل لوحة التحكم */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}

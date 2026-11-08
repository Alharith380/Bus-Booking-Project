"use client";

import { usePathname } from "next/navigation";
import { sectionLabelForPath } from "@/constants/navigation";
import { ROLE_LABELS } from "@/constants/strings";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { Status } from "@/components/ui/status";

/** الشريط العلوي: مسار تصفّح مبسّط + بطاقة الحساب */
export function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="topbar">
      <span>لوحة الإدارة&nbsp; / &nbsp;{sectionLabelForPath(pathname)}</span>
      <div className="account">
        <span className="avatar">{user ? getInitials(user.fullName) : "…"}</span>
        <span>{user?.fullName ?? "جارٍ التحميل"}</span>
        {user && <Status tone="info">{ROLE_LABELS[user.role]}</Status>}
      </div>
    </header>
  );
}

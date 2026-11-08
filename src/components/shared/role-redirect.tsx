"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROLE_HOME } from "@/lib/permissions";
import { useAuth } from "@/hooks/use-auth";

/**
 * نقطة الدخول: يوجّه المستخدم إلى مساحة عمل دوره.
 * لا يوجد توكن → صفحة تسجيل الدخول.
 */
export function RoleRedirect() {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    const home = user ? (ROLE_HOME[user.role] ?? "/login") : "/login";
    router.replace(home);
  }, [initializing, user, router]);

  return <div className="loading-state">جارٍ تحديد مساحة العمل…</div>;
}

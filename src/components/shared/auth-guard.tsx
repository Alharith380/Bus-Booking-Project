"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

/**
 * حارس دخول مساحة العمل.
 *
 * الجلسة تُقرأ على المتصفح، ولذلك يبقى هيكل الصفحة معروضاً أثناء فتح الجلسة
 * فلا يتأخر عرض التخطيط، ولا يعيد الخادم صفحة محمية قبل معرفة دور المستخدم.
 * عند تأكيد عدم وجود جلسة تُصفّى الصفحة ويُعاد التوجيه إلى تسجيل الدخول،
 * والحماية الفعلية تبقى على الخادم عبر proxy وصلاحيات الـ API.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initializing && !user) router.replace("/login");
  }, [initializing, user, router]);

  if (!initializing && !user) return null;

  return <>{children}</>;
}

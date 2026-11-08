"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NAV_ICONS, navItemsForRole } from "@/constants/navigation";
import { APP_NAME, APP_TAGLINE, ROLE_LABELS } from "@/constants/strings";
import { useAuth } from "@/hooks/use-auth";

/** الشريط الجانبي: عناصر تُرشَّح حسب دور المستخدم الحالي */
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand__mark">
          <img src={NAV_ICONS.brand} alt="" />
        </span>
        <span>
          <strong>{APP_NAME}</strong>
          <small>{APP_TAGLINE}</small>
        </span>
      </Link>

      <nav>
        {navItemsForRole(user?.role ?? null).map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[active ? "active" : "", item.mobileHidden ? "mobile-hidden" : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <img src={item.icon} alt="" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="role-card">
        <strong>صلاحيات {user ? ROLE_LABELS[user.role] : "…"}</strong>
        <span>إدارة التشغيل والحجوزات ضمن شركة واحدة.</span>
      </div>

      <button type="button" className="logout" onClick={handleLogout}>
        <img src={NAV_ICONS.logout} alt="" />
        تسجيل الخروج
      </button>
    </aside>
  );
}

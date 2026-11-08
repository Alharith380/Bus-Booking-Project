import { NextResponse, type NextRequest } from "next/server";
import { ROLE_COOKIE, TOKEN_COOKIE } from "@/constants/session";
import { ROLE_HOME } from "@/lib/permissions";
import type { Role } from "@/types";

/**
 * حماية المسارات في Next 16 (الملف يسمّى proxy بدل middleware).
 * يقرأ ملفات الارتباط نفسها التي تكتبها الواجهة عند تسجيل الدخول.
 * التحقق النهائي من الصلاحية يبقى على الخادم في كل endpoint.
 */

function readSession(request: NextRequest): { token: boolean; role: Role | null } {
  const token = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);
  const raw = request.cookies.get(ROLE_COOKIE)?.value;
  return { token, role: raw ? (raw as Role) : null };
}

function toLogin(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;
  const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/reception/login";
  return NextResponse.redirect(new URL(loginPath, request.nextUrl));
}

function toHome(request: NextRequest, role: Role | null): NextResponse {
  const home = role ? (ROLE_HOME[role] ?? "/login") : "/login";
  return NextResponse.redirect(new URL(home, request.nextUrl));
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const { token, role } = readSession(request);

  /* صفحة الدخول: مسجّل ومجاله متاح → إلى مساحة عمله */
  if (pathname === "/login" || pathname === "/admin/login" || pathname === "/reception/login") {
    if (token && role) {
      const home = ROLE_HOME[role];
      if (home && home !== "/login") return NextResponse.redirect(new URL(home, request.url));
    }
    return NextResponse.next();
  }

  /* بقية المسارات تتطلب جلسة */
  if (!token || !role) return toLogin(request);

  /* نقطة الدخول: تحويل حسب الدور */
  if (pathname === "/") return toHome(request, role);

  /* منع الدور من القسم الذي لا يملك صلاحيته */
  const isAdminArea = pathname.startsWith("/admin");
  const isDeskArea = pathname.startsWith("/desk");
  const isReceptionArea = pathname.startsWith("/reception");

  if (isAdminArea && role !== "ADMIN") return toHome(request, role);
  if ((isDeskArea || isReceptionArea) && role !== "RECEPTIONIST" && role !== "ADMIN") {
    return toHome(request, role);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets/).*)"],
};

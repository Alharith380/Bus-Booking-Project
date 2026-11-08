import { Suspense, type ReactNode } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";

/**
 * هيكل لوحة التحكم المشترك بين صفحات الإدارة والشباك.
 * يُركَّب مرة واحدة في layout الخاص بمجموعة (dashboard)،
 * وكل صفحة تضع داخله ترويستها ومحتواها عبر PageHeading.
 *
 * الشريطان يقرآن مسار الصفحة، وهو ما لا يعرفه الهيكل الساكن عند المسارات
 * الديناميكية؛ ولذلك يأخذهما Suspense خلف حدّ يحافظ على أبعادهما.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <Suspense fallback={<aside className="sidebar" aria-hidden="true" />}>
        <Sidebar />
      </Suspense>
      <main className="workspace">
        <Suspense fallback={<header className="topbar" aria-hidden="true" />}>
          <Topbar />
        </Suspense>
        <div className="page">{children}</div>
        <footer>
          <span>شركة واحدة · توقيت سورية</span>
          <span>مكتب دمشق</span>
        </footer>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/use-auth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "حجز البولمان · لوحة التشغيل",
    template: "%s · حجز البولمان",
  },
  description: "مساحة عمل موحّدة لموظفي الشركة: إدارة الرحلات، حجز المقاعد وقبض المدفوعات النقدية.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

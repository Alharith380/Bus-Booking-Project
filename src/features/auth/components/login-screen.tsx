"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/api-client";
import { ROLE_HOME } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { LoginBrand } from "@/features/auth/components/login-brand";
import { InactiveAccount } from "@/features/auth/components/inactive-account";

/** شاشة تسجيل الدخول: نصف علامة + نموذج الدخول بحساب العمل */
export function LoginScreen() {
  const router = useRouter();
  const { login, logout } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inactivePhone, setInactivePhone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (!phone.trim() || !password) {
      setError("أدخل رقم الهاتف وكلمة المرور ثم حاول مجدداً.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const user = await login({ phone: phone.trim(), password });

      if (user.role === "CUSTOMER") {
        // النظام مخصّص للموظفين: لا نترك جلسة زبون مفتوحة هنا
        logout();
        setError("هذا الدخول مخصّص لموظفي الشركة. استخدم تطبيق الحجز للزبائن.");
        return;
      }

      router.replace(ROLE_HOME[user.role] ?? "/login");
    } catch (err) {
      if (err instanceof ApiRequestError && err.code === "FORBIDDEN") {
        // الخادم يرفض الحسابات المعطّلة: نعرض شاشة الإيقاف بدل رسالة الخطأ
        logout();
        setInactivePhone(phone.trim());
        return;
      }
      setError(
        err instanceof ApiRequestError
          ? err.message
          : "تعذّر تسجيل الدخول، تحقق من الاتصال وحاول مجدداً.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <LoginBrand />

      <section className="login-form">
        {inactivePhone ? (
          <InactiveAccount phone={inactivePhone} onRetry={() => setInactivePhone(null)} />
        ) : (
          <form onSubmit={submit} noValidate>
            <h1>أهلاً بعودتك</h1>
            <p>سجّل الدخول بحساب العمل لمتابعة إدارة الرحلات والحجوزات.</p>

            <Field
              label="رقم الهاتف"
              type="tel"
              inputMode="tel"
              autoComplete="username"
              placeholder="09xxxxxxxx"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setError(null);
              }}
            />

            <Field
              label="كلمة المرور"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(null);
              }}
            />

            {error && (
              <Notice title="تعذّر تسجيل الدخول" tone="danger">
                {error}
              </Notice>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? "جارٍ التحقق…" : "تسجيل الدخول"}
            </Button>

            <p className="caption">هل نسيت كلمة المرور؟ تواصل مع مدير الشركة لإعادة تعيينها.</p>
            <p className="caption">
              تُحدد مساحة الإدارة أو الاستقبال تلقائياً بحسب صلاحيات حسابك. لا يوجد تسجيل عام
              للعملاء هنا.
            </p>
          </form>
        )}
      </section>
    </main>
  );
}

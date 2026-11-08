import { NAV_ICONS } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

interface InactiveAccountProps {
  phone: string;
  onRetry: () => void;
}

/** حالة الحساب غير النشط: يعيدها الخادم بـFORBIDDEN عند تسجيل الدخول */
export function InactiveAccount({ phone, onRetry }: InactiveAccountProps) {
  return (
    <div className="access-state">
      <img src={NAV_ICONS.shield} alt="" />
      <Card title="هذا الحساب موقوف مؤقتاً">
        <Status tone="danger">حساب غير نشط</Status>
        <p>
          تواصل مع مدير الشركة لإعادة التفعيل. إعادة المحاولة لا تتجاوز صلاحيات حسابك، ولا يمكن
          إنشاء حجوزات حتى استعادة الوصول.
        </p>
        <dl>
          <div>
            <dt>الحساب</dt>
            <dd>{phone}</dd>
          </div>
          <div>
            <dt>جهة المساعدة</dt>
            <dd>مدير الشركة · تحويلة 101</dd>
          </div>
        </dl>
        <Notice title="إذا كان الحساب نشطاً لدى الإدارة" tone="info">
          سجّل الخروج ثم ادخل مجدداً لتحديث الصلاحيات، أو أعد المحاولة بعد تأكيد التفعيل.
        </Notice>
        <div className="actions">
          <Button type="button" onClick={onRetry}>
            إعادة المحاولة
          </Button>
          <Button type="button" variant="outline" onClick={onRetry}>
            تسجيل الخروج
          </Button>
        </div>
      </Card>
    </div>
  );
}

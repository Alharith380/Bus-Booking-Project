"use client";

import { PageHeading } from "@/components/shared/page-heading";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

/** المهل والسياسات المعتمدة كقيم مبدئية في عقد الـ API §1 */
const DEFAULTS = {
  paymentMinutes: 120,
  holdMinutes: 10,
  lastCallMinutes: 180,
};

const REFUND_POLICY: Array<[string, string]> = [
  ["24 ساعة فأكثر", "100%"],
  ["من 6 إلى أقل من 24 ساعة", "50%"],
  ["أقل من 6 ساعات", "0%"],
];

const DEFERRED: Array<[string, string]> = [
  ["رسائل SMS", "بعد الإطلاق · الاتصال الهاتفي حالياً"],
  ["الدفع الإلكتروني", "مستقبلي · النقد فقط الآن"],
  ["لغات إضافية", "مستقبلية · العربية متاحة فقط"],
  ["صعود الركاب عبر QR", "بعد الإطلاق · لا تفعيل للصعود هنا"],
  ["تجميع شركات متعددة", "مستقبلي · هذه اللوحة لشركة واحدة"],
];

/**
 * إعدادات الشركة: عرض قيم التشغيل المبدئية وسياسة الاسترداد المقترحة.
 * لا يوجد endpoint للحفظ في العقد، ولذلك تُعرض للقراءة فقط حتى تعتمدها الشركة.
 */
export function SettingsScreen() {
  return (
    <>
      <PageHeading
        title="إعدادات الشركة"
        subtitle="ضوابط تشغيل الإصدار الأول · قيم مبدئية من عقد الـ API"
      />

      <Notice title="قيم بانتظار اعتماد الشركة" tone="warning">
        لا يوجد endpoint لحفظ الإعدادات في العقد الحالي، ولذلك تُعرض القيم للقراءة فقط. تعتمد
        الشركة هذه الأرقام أولاً ثم يُربط التخزين عند إضافة مسار التعديل.
      </Notice>

      <div className="content-grid content-grid--settings">
        <div className="stack">
          <Card title="المهل والتحصيل النقدي" className="form-card">
            <div className="form-row">
              <Field
                label="مهلة الدفع النقدي · دقائق"
                value={DEFAULTS.paymentMinutes}
                readOnly
              />
              <Field
                label="مدة احتجاز المقاعد · دقائق"
                value={DEFAULTS.holdMinutes}
                readOnly
              />
            </div>
            <Field
              label="آخر وقت للدفع قبل المغادرة · دقائق"
              value={DEFAULTS.lastCallMinutes}
              readOnly
            />
            <p className="caption">
              المقاعد تُحرَّر تلقائياً بعد مهلة الاحتجاز. الموعد النهائي للدفع = الأقرب بين مهلة
              الدفع وهذا الحد، ولا تُنشأ حجوزات معلّقة بعده.
            </p>
          </Card>

          <Card title="سياسة الاسترداد المقترحة">
            <Status tone="warning">غير معتمدة · تحتاج تأكيد الشركة</Status>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الوقت قبل المغادرة</th>
                    <th>الرد المقترح</th>
                  </tr>
                </thead>
                <tbody>
                  {REFUND_POLICY.map(([window, percent]) => (
                    <tr key={window}>
                      <td>{window}</td>
                      <td>{percent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="caption">
              اعتماد هذه السياسة رسمياً · لا تُفعّل النسب تلقائياً قبل موافقة الإدارة.
            </p>
          </Card>
        </div>

        <div className="stack">
          <Card title="التكاملات والميزات المؤجلة" className="deferred">
            {DEFERRED.map(([title, detail]) => (
              <div key={title}>
                <Status tone="neutral">غير مفعّلة</Status>
                <strong>{title}</strong>
                <span>{detail}</span>
              </div>
            ))}
          </Card>

          <Notice title="تغييرات تحتاج تأكيداً">
            القيم المعروضة مبدئية من وثيقة العقد وليست قواعد معتمدة من الشركة. يجب اعتمادها قبل
            استخدامها فعلياً في التشغيل.
          </Notice>
        </div>
      </div>
    </>
  );
}

import { NAV_ICONS } from "@/constants/navigation";

/** النصف التعريفي لشاشة الدخول: العلامة والرسالة الأساسية */
export function LoginBrand() {
  return (
    <section className="login-brand">
      <img src={NAV_ICONS.busFront} alt="" />
      <h2>حجز البولمان</h2>
      <h1>
        تشغيل منظّم،
        <br />
        ورحلة أوضح لكل مسافر.
      </h1>
      <p>مساحة عمل موحّدة لموظفي الشركة: إدارة الرحلات، حجز المقاعد وقبض المدفوعات النقدية.</p>
      <div>
        <strong>دخول الموظفين والإدارة فقط</strong>
        <br />
        <span>
          للمساعدة: مسؤول النظام في مكتب دمشق
          <br />
          الدعم الداخلي · تحويلة 101
        </span>
      </div>
      <small>الدخول المشترك · شركة واحدة · الإصدار الأول</small>
    </section>
  );
}

# معمارية واجهة نظام الحافلات

هذا المستودع يحتوي على هيكل المشروع فقط. ملفات التطبيق فارغة ومخصصة ليبدأ الفريق تنفيذها؛ لا توجد ميزات أو واجهات أو منطق أعمال منفذ حاليًا.

## تنظيم التطبيق

- `src/app`: تعريف المسارات والـ layouts فقط، مع تقسيم المصادقة ولوحة التحكم إلى Route Groups.
- `src/features`: وحدات الميزات؛ توضع مكونات كل ميزة وخدماتها وأنواعها داخل وحدتها.
- `src/components/ui`: مكونات واجهة shadcn.
- `src/components/shared`: المكونات المشتركة بين الميزات.
- `src/lib`: تكامل API والتخزين والصلاحيات والأدوات المشتركة.
- `src/hooks`: الخطافات العامة.
- `src/constants`: التنقل والنصوص الثابتة.
- `src/types`: الأنواع المشتركة.
- `src/middleware.ts`: نقطة تنظيم حماية المسارات.

## المسارات

| المسار | الغرض |
| --- | --- |
| `src/app/page.tsx` | نقطة الدخول والتحويل حسب الدور |
| `src/app/(auth)/login/page.tsx` | تسجيل الدخول |
| `src/app/(dashboard)/desk/page.tsx` | البحث عن رحلة في الشباك |
| `src/app/(dashboard)/desk/trips/[tripId]/page.tsx` | تفاصيل الرحلة واختيار المقاعد والحجز |
| `src/app/(dashboard)/desk/bookings/page.tsx` | قائمة الحجوزات والبحث |
| `src/app/(dashboard)/desk/bookings/[id]/page.tsx` | تفاصيل الحجز والتذكرة |
| `src/app/(dashboard)/admin/page.tsx` | لوحة الإدارة |
| `src/app/(dashboard)/admin/trips/page.tsx` | إدارة الرحلات والأسعار |
| `src/app/(dashboard)/admin/trips/new/page.tsx` | إنشاء رحلة طارئة |
| `src/app/(dashboard)/admin/trips/schedules/page.tsx` | جدولة الرحلات |
| `src/app/(dashboard)/admin/fleet/page.tsx` | إدارة الحافلات |
| `src/app/(dashboard)/admin/fleet/types/page.tsx` | أنواع الحافلات |
| `src/app/(dashboard)/admin/lines/page.tsx` | المدن والمسارات |
| `src/app/(dashboard)/admin/users/page.tsx` | إدارة الموظفين |
| `src/app/(dashboard)/admin/reports/page.tsx` | التقارير |

`(auth)` و`(dashboard)` مجموعتا تنظيم لا تظهران في عناوين URL. تخطيط لوحة التحكم مشترك بين صفحات الشباك والإدارة.

## حدود الميزات

- `src/features/auth`: مكونات وخطافات وخدمات وأنواع المصادقة.
- `src/features/desk`: البحث والحجز السريع واختيار المقاعد والدفع.
- `src/features/bookings`: قائمة الحجوزات وتفاصيلها والتذاكر.
- `src/features/trips`: الرحلات والرحلات الطارئة والأسعار والجدولة.
- `src/features/fleet`: الحافلات وأنواعها.
- `src/features/lines`: المدن والمسارات.
- `src/features/users`: المستخدمون والموظفون.
- `src/features/dashboard`: الإحصائيات والتقارير.

### بنية كل ميزة (موحّدة)

```
features/<name>/
├── components/     # مكونات الميزة
├── hooks/          # خطافات الميزة
├── services/       # <name>-service.ts — نقطة الاتصال بالـ API
└── types.ts        # أنواع الميزة (DTOs)
```

**قواعد إعادة الاستخدام:**
- النداء الشبكي يتم **فقط** داخل `features/*/services` وعبر `lib/api-client.ts` — لا `fetch` مباشر في المكونات أو الصفحات.
- الأنواع الخاصة بالميزة في `types.ts`، والمشتركة بين ميزتين أو أكثر في `src/types`.
- المكوّن المستخدم في ميزتين أو أكثر ينتقل إلى `components/shared`.
- `src/app` يبقى تركيباً فقط (route → feature) بدون منطق.

## نقاط البدء المشتركة

- `src/lib/api-client.ts`: نقطة الاتصال الوحيدة بالباك إند.
- `src/lib/auth-storage.ts`: مكان تنظيم تخزين التوكن في cookie.
- `src/lib/permissions.ts`: مكان تنظيم الصلاحيات؛ المدير يرث صلاحيات موظف الاستقبال.
- `src/lib/utils.ts`: أدوات الواجهة المشتركة.
- `src/hooks/use-auth.ts` و`src/hooks/use-debounce.ts`: خطافات عامة.
- `src/constants/navigation.ts` و`src/constants/strings.ts`: بيانات التنقل والنصوص.

## إعدادات المشروع

إعدادات Next.js وTypeScript وإدارة الحزم موجودة في جذر المستودع. alias الاستيراد `@/` يشير إلى `src/`. ملف `.env.local` موجود كقالب فارغ، ويحتاج الفريق إلى تزويده بقيمة `NEXT_PUBLIC_API_URL`. ملف `components.json` موجود كموضع إعداد لمكونات shadcn.

> ابدأ التنفيذ داخل `src/` مع إبقاء ملفات `src/app` مقتصرة على تركيب المسارات وربط الميزات.

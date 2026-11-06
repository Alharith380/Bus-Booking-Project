# bus-api — الهيكل المعماري (Clean Architecture)

> **ملاحظة:** ملفات الراوتات (`routes.ts`) والثوابت/المخططات المشتركة فقط مليانة (المسارات ترجع `501`)؛ بقية الملفات فارغة عمداً ويملأها الفريق.

## الشجرة

```
bus-api/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── main.ts                          # نقطة التشغيل
│   ├── app.ts                           # تجميع الـ app (middlewares + routes)
│   │
│   ├── config/
│   │   ├── env.ts                       # قراءة وتحقق من .env
│   │   └── prisma.ts                    # إنشاء عميل Prisma
│   │
│   ├── common/                          # العام المشترك
│   │   ├── constants/                   # roles, trip-type, trip-status, booking-status, payment-status
│   │   ├── schemas/                     # idParam + pagination (zod)
│   │   ├── guards/                      # auth, require-role
│   │   ├── pipes/                       # validate
│   │   ├── filters/                     # errorHandler
│   │   ├── errors/                      # AppError
│   │   ├── utils/                       # jwt, password, asyncHandler, pagination
│   │   ├── types/                       # express.d.ts
│   │   └── seat-layout/                 # القوالب الستة + توليد المقاعد
│   │
│   ├── adapters/                        # بوابات الخدمات الخارجية
│   │   ├── payment/                     # الواجهة + CashPayment (الآن)
│   │   ├── sms/                         # الواجهة + ConsoleSms (للتطوير)
│   │   └── notification/                # لاحقاً
│   │
│   ├── modules/                         # = features في الموبايل
│   │   ├── auth/
│   │   ├── company/                     # اسم الشركة والشعار والعملة (صف واحد)
│   │   ├── cities/
│   │   ├── lines/                       # المسارات
│   │   ├── bus-types/
│   │   ├── buses/
│   │   ├── trips/                       # MANUAL (إضافية) + SCHEDULED
│   │   ├── schedules/
│   │   ├── bookings/
│   │   ├── payments/                    # الدفع النقدي عند الاستقبال
│   │   ├── users/
│   │   └── reports/
│   │
│   ├── jobs/                            # generate-trips, release-holds
│   └── routes/
│       ├── index.ts                     # تجميع كل الموجّهات
│       ├── public.ts                    # الواجهة العامة (ثابتة وموثقة)
│       ├── customer.ts                  # موبايل
│       ├── staff.ts                     # استقبال + إدارة
│       └── admin.ts                     # إدارة
│
├── .env, .env.example, .gitignore
└── package.json, tsconfig.json
```

## اتفاقية كل وحدة (module) — الطبقات

كل مجلد داخل `src/modules/` يحتوي على نفس النمط الستة، والاستيراد باتجاه واحد فقط:

```
routes → controller → service → repository → Prisma
                          ↘ adapters (لاحقاً)
```

| الملف | المسؤولية | يستورد من |
|---|---|---|
| `routes.ts` | تعريف الـ endpoints والـ middlewares | controller |
| `controller.ts` | استقبال الطلب والرد | service |
| `service.ts` | منطق العمل والقواعد | repository + common |
| `repository.ts` | الوصول للبيانات (Prisma) | prisma |
| `schema.ts` | مخططات التحقق (zod) | zod |
| `types.ts` | DTOs الخاصة بالموديول | — |

**قاعدة الطبقات:** لا استيراد من طبقة أعلى أبداً — `repository` لا يعرف `service`، و`service` لا يعرف `controller` ولا `req/res`. هذا ما يجعل السيرفس قابلاً لإعادة الاستخدام والاختبار.

## ترتيب الاستجابة (Routes)

| الملف          | الجمهور                     |
|----------------|------------------------------|
| `public.ts`    | بلا مصادقة (بحث، جداول ثابتة) |
| `customer.ts`  | موبايل العميل — Bearer token  |
| `staff.ts`     | الاستقبال والموظفون          |
| `admin.ts`     | الإدارة الكاملة               |

## خريطة المسارات (API)

البادئة موحّدة: `/api/v1` — تُغيّر من `src/routes/index.ts` فقط.

| المجموعة | البادئة | المصادقة |
|---|---|---|
| عام | `/api/v1/public` | بلا مصادقة |
| عميل | `/api/v1/customer` | Bearer |
| استقبال | `/api/v1/staff` | `desk` أو `admin` |
| إدارة | `/api/v1/admin` | `admin` |

**public:** `POST /auth/login` · `POST /auth/register` · `GET /company` · `GET /cities` · `GET /lines` · `GET /bus-types` · `GET /trips?from=&to=&date=` · `GET /trips/:id` · `GET /trips/:tripId/seats`

**customer:** `GET /bookings` · `GET /bookings/:id` · `POST /bookings` · `POST|DELETE /trips/:tripId/seats/:seatId/hold`

**staff:** `GET /trips` · `GET /trips/:id` · `GET /trips/:tripId/seats` · `POST|DELETE /trips/:tripId/seats/:seatId/hold` · `GET /bookings` · `GET /bookings/:id` · `POST /bookings` · `PATCH /bookings/:id` · `POST /payments` · `GET /payments`

**admin:** `users` (CRUD) · `company` (GET/PATCH) · `cities|lines|bus-types|buses` (CRUD) · `trips` (CRUD + رحلة MANUAL) · `schedules` (CRUD + `POST /:id/generate`) · `payments` (GET) · `reports/{overview,bookings,revenue,trips}`

> جميع المسارات الحالية ترجع `501 Not implemented` — واجهة فقط، والفريق يستبدل `notImplemented` بالكنترولر.

## إعادة الاستخدام (common)

| الملف | يُستخدم في | لماذا |
|---|---|---|
| `constants/roles.ts` | guards, auth, users | مصدر وحيد للأدوار (يطابق Prisma) |
| `constants/trip-type.ts` | trips, schedules | SCHEDULED / MANUAL |
| `constants/trip-status.ts` | trips, jobs | حالات الرحلة |
| `constants/booking-status.ts` | bookings, payments, reports | حالات الحجز |
| `constants/payment-status.ts` | payments, reports | حالات الدفع |
| `schemas/common.schema.ts` | كل موديول | `idParam` + `paginationQuery` بدل التكرار |
| `utils/pagination.ts` | كل القوائم | `parsePagination` + `buildPaginationMeta` |
| `seat-layout/` | bus-types, trips, bookings | القوالب الستة + توليد المقاعد |
| `guards/`, `pipes/`, `filters/`, `errors/` | كل الموديولات | عرضية (cross-cutting) |

> **قاعدة:** أي شيء يُستخدم في موديولين أو أكثر ينتقل إلى `common/` — لا نسخ بين الموديولات.
> **الترقيم لا يغيّر شكل الاستجابة:** القوائم تبقى مصفوفات كما يتوقع الموبايل، والعدد الكلي في هيدر `X-Total-Count`.

## نقاط التخصيص (White-label)

| ما يُخصّص | المكان |
|---|---|
| الاسم / الشعار / العملة | `modules/company` — صف واحد |
| قوالب المقاعد (6) | `common/seat-layout/templates.ts` |
| توليد المقاعد من القالب | `common/seat-layout/generator.ts` |
| مدة الحجز المؤقت | إعدادات الشركة + `jobs/release-holds.ts` |
| مزود الدفع / الرسائل | `adapters/` — لاحقاً، بدون لمس الموديولات |
| الأدوار والصلاحيات | `common/constants/roles.ts` + `common/guards/` |
| بادئة الـ API | `routes/index.ts` — سطر واحد |

## مطابقة الشاشات مع الـ API

### الفرونت (Next.js)

| الصفحة | Endpoints |
|---|---|
| `(auth)/login` | `POST /public/auth/login` |
| `page.tsx` (تحويل حسب الدور) | `GET /staff/me` |
| `desk` (بحث الشباك) | `GET /staff/trips?from=&to=&date=` |
| `desk/trips/[tripId]` | `GET /staff/trips/:id` · `GET /staff/trips/:id/seats` · `POST /staff/bookings` · `POST /staff/payments` |
| `desk/bookings` | `GET /staff/bookings` |
| `desk/bookings/[id]` (التذكرة) | `GET /staff/bookings/:id` |
| `admin` (لوحة الإدارة) | `GET /admin/reports/overview` |
| `admin/trips` | `GET|PATCH|DELETE /admin/trips` |
| `admin/trips/new` (طارئة) | `POST /admin/trips` |
| `admin/trips/schedules` | `GET|POST|PATCH|DELETE /admin/schedules` |
| `admin/fleet` | `GET|POST|PATCH|DELETE /admin/buses` |
| `admin/fleet/types` | `GET|POST|PATCH|DELETE /admin/bus-types` |
| `admin/lines` (مدن + مسارات) | `/admin/cities` · `/admin/lines` |
| `admin/users` | `GET|POST|PATCH|DELETE /admin/users` |
| `admin/reports` | `GET /admin/reports/{overview,bookings,revenue,trips}` |

### الموبايل (Expo)

| الشاشة | Endpoints |
|---|---|
| `(auth)/login` | `POST /public/auth/login` |
| `(auth)/register` | `POST /public/auth/register` |
| `(tabs)/index` + `trips/results` | `GET /public/trips?from=&to=&date=` · `GET /public/cities` |
| `trips/[id]` | `GET /public/trips/:id` · `GET /public/trips/:id/seats` |
| اختيار المقعد | `POST|DELETE /customer/trips/:tripId/seats/:seatId/hold` |
| `booking/confirm` | `POST /customer/bookings` — `{ tripId, seat }` |
| `booking/ticket/[id]` | `GET /customer/bookings/:id` |
| `(tabs)/bookings` | `GET /customer/bookings` |
| `(tabs)/profile` | `GET|PATCH /customer/me` |

## المهام المجدولة (jobs)

- `generate-trips.ts` — توليد رحلات SCHEDULED من schedules
- `release-holds.ts` — تحرير المقاعد المحجوزة مؤقتاً (hold timeout)

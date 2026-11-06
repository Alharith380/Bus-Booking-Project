import { Router, type Request, type Response } from 'express';

// معالجات مؤقتة — يستبدلها الفريق بالكنترولر لاحقاً
const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الواجهة العامة: تسجيل الدخول والتسجيل
export const publicRouter = Router();

// POST /api/v1/public/auth/login — { email, password } → { token }
publicRouter.post('/login', notImplemented);

// POST /api/v1/public/auth/register — { email, password, name, phone } → { token }
publicRouter.post('/register', notImplemented);

// موبايل العميل: الملف الشخصي (يُركّب على /customer/me)
export const customerRouter = Router();

// GET /api/v1/customer/me
customerRouter.get('/', notImplemented);

// PATCH /api/v1/customer/me — تحديث الاسم / الهاتف
customerRouter.patch('/', notImplemented);

// لوحة التحكم (استقبال + إدارة): الموظف الحالي ودوره (يُركّب على /staff/me)
export const staffRouter = Router();

// GET /api/v1/staff/me — يعيد المستخدم + role (لتحويل الفرونت حسب الدور)
staffRouter.get('/', notImplemented);

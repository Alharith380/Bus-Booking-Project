import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الواجهة العامة: البحث عن الرحلات وعرض التفاصيل والمقاعد
export const publicRouter = Router();

// GET /api/v1/public/trips?from=&to=&date=
publicRouter.get('/', notImplemented);

// GET /api/v1/public/trips/:id
publicRouter.get('/:id', notImplemented);

// GET /api/v1/public/trips/:tripId/seats
publicRouter.get('/:tripId/seats', notImplemented);

// موبايل العميل: حجز المقعد مؤقتاً قبل تأكيد الحجز
export const customerRouter = Router();

// POST /api/v1/customer/trips/:tripId/seats/:seatId/hold
customerRouter.post('/:tripId/seats/:seatId/hold', notImplemented);

// DELETE /api/v1/customer/trips/:tripId/seats/:seatId/hold
customerRouter.delete('/:tripId/seats/:seatId/hold', notImplemented);

// الاستقبال: عرض الرحلات والمقاعد + حجز مؤقت (نفس صلاحيات البحث)
export const staffRouter = Router();

// GET /api/v1/staff/trips?from=&to=&date=
staffRouter.get('/', notImplemented);

// GET /api/v1/staff/trips/:id
staffRouter.get('/:id', notImplemented);

// GET /api/v1/staff/trips/:tripId/seats
staffRouter.get('/:tripId/seats', notImplemented);

// POST /api/v1/staff/trips/:tripId/seats/:seatId/hold
staffRouter.post('/:tripId/seats/:seatId/hold', notImplemented);

// DELETE /api/v1/staff/trips/:tripId/seats/:seatId/hold
staffRouter.delete('/:tripId/seats/:seatId/hold', notImplemented);

// الإدارة: إدارة الرحلات (MANUAL إضافية + SCHEDULED)
export const adminRouter = Router();

// GET /api/v1/admin/trips
adminRouter.get('/', notImplemented);

// GET /api/v1/admin/trips/:id
adminRouter.get('/:id', notImplemented);

// POST /api/v1/admin/trips — رحلة إضافية (MANUAL)
adminRouter.post('/', notImplemented);

// PATCH /api/v1/admin/trips/:id
adminRouter.patch('/:id', notImplemented);

// DELETE /api/v1/admin/trips/:id
adminRouter.delete('/:id', notImplemented);

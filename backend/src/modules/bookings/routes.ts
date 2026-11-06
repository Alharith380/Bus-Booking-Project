import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// موبايل العميل: حجوزات المستخدم الحالي
export const customerRouter = Router();

// GET /api/v1/customer/bookings
customerRouter.get('/', notImplemented);

// GET /api/v1/customer/bookings/:id
customerRouter.get('/:id', notImplemented);

// POST /api/v1/customer/bookings — { tripId, seat }
customerRouter.post('/', notImplemented);

// الاستقبال: كل الحجوزات + الحجز السريع + تعديل الحالة
export const staffRouter = Router();

// GET /api/v1/staff/bookings
staffRouter.get('/', notImplemented);

// GET /api/v1/staff/bookings/:id
staffRouter.get('/:id', notImplemented);

// POST /api/v1/staff/bookings — { tripId, seat, passengerName? }
staffRouter.post('/', notImplemented);

// PATCH /api/v1/staff/bookings/:id — تأكيد / إلغاء
staffRouter.patch('/:id', notImplemented);

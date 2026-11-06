import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الاستقبال: الدفع النقدي عند الاستقبال
export const staffRouter = Router();

// POST /api/v1/staff/payments — { bookingId, amount }
staffRouter.post('/', notImplemented);

// GET /api/v1/staff/payments
staffRouter.get('/', notImplemented);

// الإدارة: مراجعة المدفوعات
export const adminRouter = Router();

// GET /api/v1/admin/payments
adminRouter.get('/', notImplemented);

// GET /api/v1/admin/payments/:id
adminRouter.get('/:id', notImplemented);

import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الإدارة: الإحصائيات والتقارير
export const adminRouter = Router();

// GET /api/v1/admin/reports/overview — لوحة التحكم
adminRouter.get('/overview', notImplemented);

// GET /api/v1/admin/reports/bookings
adminRouter.get('/bookings', notImplemented);

// GET /api/v1/admin/reports/revenue
adminRouter.get('/revenue', notImplemented);

// GET /api/v1/admin/reports/trips
adminRouter.get('/trips', notImplemented);

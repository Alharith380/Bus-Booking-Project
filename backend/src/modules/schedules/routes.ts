import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الإدارة: CRUD الجدولة (SCHEDULED)
export const adminRouter = Router();

// GET /api/v1/admin/schedules
adminRouter.get('/', notImplemented);

// POST /api/v1/admin/schedules
adminRouter.post('/', notImplemented);

// PATCH /api/v1/admin/schedules/:id
adminRouter.patch('/:id', notImplemented);

// DELETE /api/v1/admin/schedules/:id
adminRouter.delete('/:id', notImplemented);

// POST /api/v1/admin/schedules/:id/generate — توليد رحلات يدوياً
adminRouter.post('/:id/generate', notImplemented);

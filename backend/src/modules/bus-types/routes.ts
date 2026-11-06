import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الواجهة العامة: قائمة أنواع الحافلات (للعرض)
export const publicRouter = Router();

// GET /api/v1/public/bus-types
publicRouter.get('/', notImplemented);

// الإدارة: CRUD أنواع الحافلات (مع تخطيط المقاعد)
export const adminRouter = Router();

// GET /api/v1/admin/bus-types
adminRouter.get('/', notImplemented);

// POST /api/v1/admin/bus-types
adminRouter.post('/', notImplemented);

// PATCH /api/v1/admin/bus-types/:id
adminRouter.patch('/:id', notImplemented);

// DELETE /api/v1/admin/bus-types/:id
adminRouter.delete('/:id', notImplemented);

import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الإدارة: CRUD أسطول الحافلات
export const adminRouter = Router();

// GET /api/v1/admin/buses
adminRouter.get('/', notImplemented);

// POST /api/v1/admin/buses
adminRouter.post('/', notImplemented);

// PATCH /api/v1/admin/buses/:id
adminRouter.patch('/:id', notImplemented);

// DELETE /api/v1/admin/buses/:id
adminRouter.delete('/:id', notImplemented);

import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الواجهة العامة: قائمة المسارات
export const publicRouter = Router();

// GET /api/v1/public/lines
publicRouter.get('/', notImplemented);

// الإدارة: CRUD المسارات
export const adminRouter = Router();

// GET /api/v1/admin/lines
adminRouter.get('/', notImplemented);

// POST /api/v1/admin/lines
adminRouter.post('/', notImplemented);

// PATCH /api/v1/admin/lines/:id
adminRouter.patch('/:id', notImplemented);

// DELETE /api/v1/admin/lines/:id
adminRouter.delete('/:id', notImplemented);

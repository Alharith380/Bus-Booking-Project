import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الواجهة العامة: قائمة المدن
export const publicRouter = Router();

// GET /api/v1/public/cities
publicRouter.get('/', notImplemented);

// الإدارة: CRUD المدن
export const adminRouter = Router();

// GET /api/v1/admin/cities
adminRouter.get('/', notImplemented);

// POST /api/v1/admin/cities
adminRouter.post('/', notImplemented);

// PATCH /api/v1/admin/cities/:id
adminRouter.patch('/:id', notImplemented);

// DELETE /api/v1/admin/cities/:id
adminRouter.delete('/:id', notImplemented);

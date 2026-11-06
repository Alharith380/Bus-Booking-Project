import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الإدارة: CRUD الموظفين والمستخدمين
export const adminRouter = Router();

// GET /api/v1/admin/users
adminRouter.get('/', notImplemented);

// GET /api/v1/admin/users/:id
adminRouter.get('/:id', notImplemented);

// POST /api/v1/admin/users
adminRouter.post('/', notImplemented);

// PATCH /api/v1/admin/users/:id
adminRouter.patch('/:id', notImplemented);

// DELETE /api/v1/admin/users/:id
adminRouter.delete('/:id', notImplemented);

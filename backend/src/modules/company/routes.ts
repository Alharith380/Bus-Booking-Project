import { Router, type Request, type Response } from 'express';

const notImplemented = (_req: Request, res: Response) =>
  res.status(501).json({ message: 'Not implemented' });

// الواجهة العامة: معلومات الشركة (اسم، شعار، عملة)
export const publicRouter = Router();

// GET /api/v1/public/company
publicRouter.get('/', notImplemented);

// الإدارة: تعديل معلومات الشركة (صف واحد)
export const adminRouter = Router();

// GET /api/v1/admin/company
adminRouter.get('/', notImplemented);

// PATCH /api/v1/admin/company
adminRouter.patch('/', notImplemented);

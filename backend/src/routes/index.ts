import { Router } from 'express';

import adminRoutes from './admin';
import customerRoutes from './customer';
import publicRoutes from './public';
import staffRoutes from './staff';

// نقطة الربط الوحيدة — تغيير البادئة هنا فقط
const apiRouter = Router();

apiRouter.use('/api/v1/public', publicRoutes);
apiRouter.use('/api/v1/customer', customerRoutes);
apiRouter.use('/api/v1/staff', staffRoutes);
apiRouter.use('/api/v1/admin', adminRoutes);

export default apiRouter;

import { Router } from 'express';

import { adminRouter as busTypesRoutes } from '../modules/bus-types/routes';
import { adminRouter as busesRoutes } from '../modules/buses/routes';
import { adminRouter as citiesRoutes } from '../modules/cities/routes';
import { adminRouter as companyRoutes } from '../modules/company/routes';
import { adminRouter as linesRoutes } from '../modules/lines/routes';
import { adminRouter as paymentsRoutes } from '../modules/payments/routes';
import { adminRouter as reportsRoutes } from '../modules/reports/routes';
import { adminRouter as schedulesRoutes } from '../modules/schedules/routes';
import { adminRouter as tripsRoutes } from '../modules/trips/routes';
import { adminRouter as usersRoutes } from '../modules/users/routes';

// الإدارة — requireRole('admin')
// لاحقاً: يُركّب auth + require-role هنا قبل الموديولات
const router = Router();

router.use('/company', companyRoutes);
router.use('/cities', citiesRoutes);
router.use('/lines', linesRoutes);
router.use('/bus-types', busTypesRoutes);
router.use('/buses', busesRoutes);
router.use('/trips', tripsRoutes);
router.use('/schedules', schedulesRoutes);
router.use('/payments', paymentsRoutes);
router.use('/users', usersRoutes);
router.use('/reports', reportsRoutes);

export default router;

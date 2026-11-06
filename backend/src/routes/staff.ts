import { Router } from 'express';

import { staffRouter as meRoutes } from '../modules/auth/routes';
import { staffRouter as bookingsRoutes } from '../modules/bookings/routes';
import { staffRouter as paymentsRoutes } from '../modules/payments/routes';
import { staffRouter as tripsRoutes } from '../modules/trips/routes';

// الاستقبال — requireRole('desk', 'admin')  (المدير يرث صلاحيات الاستقبال)
// لاحقاً: يُركّب auth + require-role هنا قبل الموديولات
const router = Router();

router.use('/me', meRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/payments', paymentsRoutes);
router.use('/trips', tripsRoutes);

export default router;

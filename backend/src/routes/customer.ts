import { Router } from 'express';

import { customerRouter as meRoutes } from '../modules/auth/routes';
import { customerRouter as bookingsRoutes } from '../modules/bookings/routes';
import { customerRouter as tripsRoutes } from '../modules/trips/routes';

// موبايل العميل — Bearer token
// لاحقاً: يُركّب auth guard هنا قبل الموديولات
const router = Router();

router.use('/me', meRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/trips', tripsRoutes);

export default router;

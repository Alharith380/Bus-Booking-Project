import { Router } from 'express';

import { publicRouter as authRoutes } from '../modules/auth/routes';
import { publicRouter as busTypesRoutes } from '../modules/bus-types/routes';
import { publicRouter as citiesRoutes } from '../modules/cities/routes';
import { publicRouter as companyRoutes } from '../modules/company/routes';
import { publicRouter as linesRoutes } from '../modules/lines/routes';
import { publicRouter as tripsRoutes } from '../modules/trips/routes';

// الواجهة العامة — بلا مصادقة (ثابتة وموثقة)
const router = Router();

router.use('/auth', authRoutes);
router.use('/company', companyRoutes);
router.use('/cities', citiesRoutes);
router.use('/lines', linesRoutes);
router.use('/bus-types', busTypesRoutes);
router.use('/trips', tripsRoutes);

export default router;

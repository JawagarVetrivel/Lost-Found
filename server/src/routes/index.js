import { Router } from 'express';
import authRoutes from './authRoutes.js';
import itemsRoutes from './itemsRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import matchesRoutes from './matchesRoutes.js';
import claimsRoutes from './claimsRoutes.js';
import notificationsRoutes from './notificationsRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/items', itemsRoutes);
router.use('/upload', uploadRoutes);
router.use('/matches', matchesRoutes);
router.use('/claims', claimsRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/admin', adminRoutes);

export default router;

import { Router } from 'express';
import {
  getStats,
  getUsers,
  getAdminItems,
  getAdminClaims,
  updateAdminItem,
  updateAdminUser,
  updateAdminClaim,
} from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Strictly enforce authentication and admin role
router.use(authenticate, requireRole('admin'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.get('/items', getAdminItems);
router.get('/claims', getAdminClaims);

router.patch('/items/:id', updateAdminItem);
router.patch('/users/:id', updateAdminUser);
router.patch('/claims/:id', updateAdminClaim);

export default router;

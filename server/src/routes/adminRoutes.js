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

// Allow authenticated users to read campus stats for their dashboard
router.get('/stats', authenticate, getStats);

// Strictly enforce admin role for all user management, inventory moderation, and claims review
router.use(authenticate, requireRole('admin'));
router.get('/users', getUsers);
router.get('/items', getAdminItems);
router.get('/claims', getAdminClaims);

router.patch('/items/:id', updateAdminItem);
router.patch('/users/:id', updateAdminUser);
router.patch('/claims/:id', updateAdminClaim);

export default router;

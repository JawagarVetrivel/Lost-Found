import { Router } from 'express';
import {
  createClaim,
  getMyClaims,
  getClaimById,
  updateClaimStatus,
} from '../controllers/claimsController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateCreateClaim,
  validateUpdateClaim,
} from '../validators/claimValidator.js';

const router = Router();

router.use(authenticate);

router.post('/', validateCreateClaim, createClaim);
router.get('/my', getMyClaims);
router.get('/:id', getClaimById);
router.patch('/:id', validateUpdateClaim, updateClaimStatus);

export default router;

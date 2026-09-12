import { Router } from 'express';
import {
  getMatches,
  getMatchById,
  dismissMatch,
} from '../controllers/matchesController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMatches);
router.get('/:id', getMatchById);
router.patch('/:id/dismiss', dismissMatch);

export default router;

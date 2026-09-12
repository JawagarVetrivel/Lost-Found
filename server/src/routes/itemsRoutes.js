import { Router } from 'express';
import {
  createLostItem,
  createFoundItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  updateItemStatus,
} from '../controllers/itemsController.js';
import { getItemMatches } from '../controllers/matchesController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateCreateItem,
  validateUpdateItem,
  validateItemStatus,
} from '../validators/itemValidator.js';

const router = Router();

// Public item browsing (or authenticated)
router.get('/', getItems);
router.get('/:id', getItemById);
router.get('/:id/matches', authenticate, getItemMatches);

// Protected item reporting & management
router.post('/lost', authenticate, validateCreateItem, createLostItem);
router.post('/found', authenticate, validateCreateItem, createFoundItem);
router.put('/:id', authenticate, validateUpdateItem, updateItem);
router.delete('/:id', authenticate, deleteItem);
router.patch('/:id/status', authenticate, validateItemStatus, updateItemStatus);

export default router;

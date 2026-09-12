import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  resetPassword,
  updateProfile,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validatePasswordReset,
} from '../validators/authValidator.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', authenticate, logout);
router.post('/reset-password', validatePasswordReset, resetPassword);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;

import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { upload } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Upload image (requires authentication)
router.post('/', authenticate, upload.single('image'), uploadImage);

export default router;

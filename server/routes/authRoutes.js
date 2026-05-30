import express from 'express';
import { registerAdmin, loginAdmin, getMe } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register-admin', registerAdmin);
router.post('/login', loginAdmin);
router.get('/me', protectAdmin, getMe);

export default router;

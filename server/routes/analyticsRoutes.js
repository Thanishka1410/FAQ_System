import express from 'express';
import { getAnalyticsSummary } from '../controllers/analyticsController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin-only route
router.get('/summary', protectAdmin, getAnalyticsSummary);

export default router;

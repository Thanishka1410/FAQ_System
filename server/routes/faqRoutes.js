import express from 'express';
import {
  getFAQs,
  searchFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  markHelpful,
  markNotHelpful,
  recordView,
  syncLocalFAQFile
} from '../controllers/faqController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getFAQs);
router.get('/search', searchFAQs);
router.post('/:id/helpful', markHelpful);
router.post('/:id/not-helpful', markNotHelpful);
router.post('/:id/view', recordView);

// Admin-only routes
router.post('/sync-file', protectAdmin, syncLocalFAQFile);
router.post('/', protectAdmin, createFAQ);
router.put('/:id', protectAdmin, updateFAQ);
router.delete('/:id', protectAdmin, deleteFAQ);

export default router;

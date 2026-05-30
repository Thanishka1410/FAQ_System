import express from 'express';
import {
  checkDuplicateQuestions,
  submitQuestion,
  getQuestions,
  getQuestionById,
  answerQuestion,
  updateQuestionStatus,
  deleteQuestion
} from '../controllers/questionController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/check-duplicate', checkDuplicateQuestions);
router.post('/', submitQuestion);

// Admin-only routes
router.get('/', protectAdmin, getQuestions);
router.get('/:id', protectAdmin, getQuestionById);
router.put('/:id/answer', protectAdmin, answerQuestion);
router.put('/:id/status', protectAdmin, updateQuestionStatus);
router.delete('/:id', protectAdmin, deleteQuestion);

export default router;

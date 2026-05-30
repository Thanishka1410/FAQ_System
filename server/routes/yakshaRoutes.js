import express from 'express';
import { queryYaksha, getYakshaStatus } from '../controllers/yakshaController.js';

const router = express.Router();

// @route   POST /api/yaksha-mini/query
// @desc    Query the Yaksha Mini RAG engine
router.post('/query', queryYaksha);

// @route   GET /api/yaksha-mini/status
// @desc    Get the status of Yaksha Mini RAG index
router.get('/status', getYakshaStatus);

export default router;

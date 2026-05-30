import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import yakshaRoutes from './routes/yakshaRoutes.js';

// Configure dotenv
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/yaksha-mini', yakshaRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Samagama FAQ Portal API',
    version: '1.0.0',
    status: 'healthy'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

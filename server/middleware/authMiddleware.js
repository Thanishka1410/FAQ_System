import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'samagama_secret_2026');
      
      // Get admin from the token (exclude password)
      req.admin = await Admin.findById(decoded.id).select('-password');
      
      if (!req.admin) {
        return res.status(401).json({ success: false, message: 'Not authorized, admin user not found' });
      }
      
      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

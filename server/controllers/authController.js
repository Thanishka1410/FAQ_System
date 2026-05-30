import Admin from '../models/Admin.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'samagama_secret_2026', {
    expiresIn: '30d',
  });
};

// @desc    Register a new admin
// @route   POST /api/auth/register-admin
// @access  Public (Can be restricted later, but helpful for initial setup or testing)
export const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }
    
    const admin = await Admin.create({
      name,
      email,
      password,
    });
    
    if (admin) {
      res.status(201).json({
        success: true,
        data: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid admin data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    res.json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: req.admin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

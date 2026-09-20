// backend/src/routes/userRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  getUserById,
  updateProfile,
  changePassword,
  updateRole,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', protect, admin, getUsers);

// Get user stats (admin only)
router.get('/stats', protect, admin, getUserStats);

// Get user by ID (admin only)
router.get('/:id', protect, admin, getUserById);

// Update profile (self or admin)
// Note: The :id? makes it optional
router.put(
  '/profile/:id?',
  protect,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required')
  ],
  updateProfile
);

// Change password (self or admin)
router.put(
  '/password/:id?',
  protect,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  changePassword
);

// Update user role (admin only)
router.put(
  '/role/:id',
  protect,
  admin,
  [
    body('role').isIn(['admin', 'user']).withMessage('Invalid role')
  ],
  updateRole
);

// Delete user (admin only)
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
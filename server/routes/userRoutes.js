const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  googleAuth,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  forgotPassword,
  resetPassword,
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { strictAuthLimiter } = require('../middleware/rateLimiter');

// 1. Route for user registration and fetching all users
// Path: /api/users/
router.route('/').post(strictAuthLimiter, registerUser).get(protect, admin, getUsers);

// 2. Route for user login
// Path: /api/users/login
router.post('/login', strictAuthLimiter, authUser);

// 2.1 Route for Google OAuth login/register
// Path: /api/users/google
router.post('/google', strictAuthLimiter, googleAuth);

// 2.2 Routes for Password Reset
// Path: /api/users/forgot-password and /api/users/reset-password/:token
router.post('/forgot-password', strictAuthLimiter, forgotPassword);
router.post('/reset-password/:token', strictAuthLimiter, resetPassword);

// 3. Route for user profile
// Path: /api/users/profile
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// 4. Routes for multi-address management
// Path: /api/users/addresses
router.route('/addresses').post(protect, addAddress);
router.route('/addresses/:addressId')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);
router.route('/addresses/:addressId/default').put(protect, setDefaultAddress);

// 5. Routes for individual user management (Admin only)
// Path: /api/users/:id
router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

module.exports = router;

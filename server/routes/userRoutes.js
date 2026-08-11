const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
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
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// 1. Route for user registration and fetching all users
// Path: /api/users/
router.route('/').post(registerUser).get(protect, admin, getUsers);

// 2. Route for user login
// Path: /api/users/login
router.post('/login', authUser);

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

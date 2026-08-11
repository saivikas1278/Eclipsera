const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Register a new user
 * @route   POST /api/users
 * @access  Public
 */
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // 1. Check if the user already exists in the database
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // 400 Bad Request
    throw new Error('User already exists');
  }

  // 2. Hash the password before saving it
  // We generate a "salt" (random data added to the password before hashing)
  // 10 is the number of "rounds" (higher is more secure but takes longer to compute)
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Create the user with the hashed password
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // 4. If the user was successfully created, return their data and a JWT
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/users/login
 * @access  Public
 */
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Find the user by their email
  const user = await User.findOne({ email });

  // 2. Check if the user exists AND if the passwords match
  // bcrypt.compare() safely compares the plain text password from the request
  // with the hashed password stored in our database.
  if (user && (await bcrypt.compare(password, user.password))) {
    // Passwords matched! Return the user data and a fresh JWT
    res.json({
      _id: user._id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      mobile: user.mobile,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401); // 401 Unauthorized
    throw new Error('Invalid email or password');
  }
});

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      gender: user.gender,
      mobile: user.mobile,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    if (req.body.password) {
      if (!req.body.currentPassword) {
        res.status(400);
        throw new Error('Please provide your current password to set a new one');
      }
      
      const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isMatch) {
        res.status(401);
        throw new Error('Current password is incorrect');
      }
      
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }
    
    user.name = req.body.name || user.name;
    user.firstName = req.body.firstName !== undefined ? req.body.firstName : user.firstName;
    user.lastName = req.body.lastName !== undefined ? req.body.lastName : user.lastName;
    user.gender = req.body.gender !== undefined ? req.body.gender : user.gender;
    user.mobile = req.body.mobile !== undefined ? req.body.mobile : user.mobile;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      gender: updatedUser.gender,
      mobile: updatedUser.mobile,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
      addresses: updatedUser.addresses,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Add new address to user profile
 * @route   POST /api/users/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const { label, street, city, state, postalCode, country, phone, isDefault } = req.body;
    
    const newAddress = { label, street, city, state, postalCode, country, phone, isDefault };
    
    // If this is the first address, or isDefault is true, set others to false
    if (user.addresses.length === 0 || isDefault) {
      newAddress.isDefault = true;
      user.addresses.forEach(addr => addr.isDefault = false);
    }
    
    user.addresses.push(newAddress);
    await user.save();
    
    res.status(201).json(user.addresses);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update a specific address
 * @route   PUT /api/users/addresses/:addressId
 * @access  Private
 */
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const address = user.addresses.id(req.params.addressId);
    
    if (address) {
      address.label = req.body.label || address.label;
      address.street = req.body.street || address.street;
      address.city = req.body.city || address.city;
      address.state = req.body.state || address.state;
      address.postalCode = req.body.postalCode || address.postalCode;
      address.country = req.body.country || address.country;
      address.phone = req.body.phone || address.phone;
      
      if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
        address.isDefault = true;
      }
      
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Delete a specific address
 * @route   DELETE /api/users/addresses/:addressId
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const address = user.addresses.id(req.params.addressId);
    if (address) {
      address.deleteOne();
      
      // If we deleted the default address and there are other addresses, make the first one default
      if (address.isDefault && user.addresses.length > 0) {
        user.addresses[0].isDefault = true;
      }
      
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Set an address as default
 * @route   PUT /api/users/addresses/:addressId/default
 * @access  Private
 */
const setDefaultAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    const address = user.addresses.id(req.params.addressId);
    if (address) {
      user.addresses.forEach(addr => addr.isDefault = false);
      address.isDefault = true;
      
      await user.save();
      res.json(user.addresses);
    } else {
      res.status(404);
      throw new Error('Address not found');
    }
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete yourself');
    }
    await User.deleteOne({ _id: user._id });
    res.json({ message: 'User removed' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin !== undefined ? req.body.isAdmin : user.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

/**
 * @desc    Auth user with Google OAuth (Login / Register)
 * @route   POST /api/users/google
 * @access  Public
 */
const googleAuth = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  
  if (!credential) {
    res.status(400);
    throw new Error('No Google credential provided');
  }

  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  
  // Verify the ID token
  const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID, 
  });
  const payload = ticket.getPayload();
  
  if (!payload || !payload.email) {
    res.status(400);
    throw new Error('Invalid Google Token');
  }

  const { email, name, sub: googleId } = payload;

  // Check if user exists
  let user = await User.findOne({ email });

  if (user) {
    // Merge accounts
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    // Create new user with random strong password
    const crypto = require('crypto');
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    user = await User.create({
      name,
      email,
      password: hashedPassword,
      googleId,
    });
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
    token: generateToken(user._id),
  });
});

module.exports = {
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
};

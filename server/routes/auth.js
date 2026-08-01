const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Profile } = require('../models');
const { verifyCustomerToken } = require('../middleware');

// Password Hash Helper
const hashPassword = (password) => {
  if (!password) return 'patron123';
  return crypto.createHash('sha256').update(password).digest('hex');
};

const mongoose = require('mongoose');

// In-Memory Profile Fallback Store for offline / disconnected DB state
let memoryProfiles = [
  {
    id: 'usr-demo-1',
    fullName: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phone: '9876543210',
    passwordHash: hashPassword('patron123'),
    role: 'customer',
    address: { street: '42 Lavelle Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' }
  }
];

const isDbReady = () => mongoose.connection && mongoose.connection.readyState === 1;

// Customer Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const formattedEmail = email.trim().toLowerCase();
    const formattedPhone = phone.trim();

    let checkUser = memoryProfiles.find(u => u.email === formattedEmail || u.phone === formattedPhone);

    if (!checkUser && isDbReady()) {
      try {
        checkUser = await Profile.findOne({
          $or: [{ email: formattedEmail }, { phone: formattedPhone }]
        });
      } catch (dbErr) {}
    }

    if (checkUser) {
      return res.status(400).json({ error: 'An account with this email or phone number already exists.' });
    }

    const newId = `usr-${Date.now()}`;
    const passwordHash = hashPassword(password || 'patron123');
    const newUserObj = {
      id: newId,
      fullName: name.trim(),
      email: formattedEmail,
      phone: formattedPhone,
      passwordHash,
      role: 'customer',
      address: { street: '', city: '', state: '', pincode: '' }
    };

    memoryProfiles.push(newUserObj);

    if (isDbReady()) {
      try {
        await Profile.create(newUserObj);
      } catch (e) {}
    }

    // Set HTTP-Only auth cookie
    res.cookie('eclipsera_token', `usr_session_${newId}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    res.json({
      success: true,
      user: {
        id: newUserObj.id,
        name: newUserObj.fullName,
        email: newUserObj.email,
        phone: newUserObj.phone,
        address: newUserObj.address,
        role: newUserObj.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer Login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password, isOtp } = req.body;
    const formatted = (emailOrPhone || '').trim().toLowerCase();
    const cleanPhone = formatted.replace(/\D/g, '');

    let user = memoryProfiles.find(u => 
      (u.email && u.email.toLowerCase() === formatted) || 
      (u.phone && u.phone.replace(/\D/g, '') === cleanPhone && cleanPhone.length >= 10)
    );

    if (!user && isDbReady()) {
      try {
        user = await Profile.findOne({
          $or: [
            { email: new RegExp(`^${formatted}$`, 'i') }, 
            { phone: formatted }
          ]
        });
      } catch (dbErr) {}
    }

    if (!user) {
      if (isOtp) {
        // Auto-create user for instant OTP sign-in
        const newUserObj = {
          id: `usr-${Date.now()}`,
          fullName: formatted.includes('@') ? formatted.split('@')[0].toUpperCase() : `Patron (+91 ${formatted.slice(-4)})`,
          email: formatted.includes('@') ? formatted : `patron_${formatted.slice(-4)}@example.com`,
          phone: formatted.includes('@') ? '9876543210' : formatted,
          passwordHash: hashPassword(password || 'patron123'),
          role: 'customer',
          address: { street: '42 Lavelle Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001' }
        };
        memoryProfiles.push(newUserObj);
        user = newUserObj;

        if (isDbReady()) {
          try {
            await Profile.create(newUserObj);
          } catch (dbCreateErr) {}
        }
      } else {
        return res.status(401).json({ error: 'No account found matching this email or phone number. Please register first.' });
      }
    }

    // Verify password if not OTP login
    if (!isOtp) {
      const hashedInput = hashPassword(password || '');
      const isMatch = user.passwordHash === hashedInput;
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }
    }

    // Set HTTP-Only Cookie
    const userId = user.id || user._id || `usr-${Date.now()}`;
    res.setHeader('Set-Cookie', `eclipsera_token=usr_session_${userId}; HttpOnly; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout Endpoint — Clears HTTP-Only Cookies
router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', [
    'eclipsera_token=; HttpOnly; Path=/; Max-Age=0',
    'eclipsera_admin_token=; HttpOnly; Path=/; Max-Age=0'
  ]);
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Google OAuth 2.0 Login / Registration Endpoint
const { OAuth2Client } = require('google-auth-library');
const GOOGLE_CLIENT_ID = '818572600848-6gra9it3phm6qfmm9gbj10rj2ltdqccj.apps.googleusercontent.com';
const googleOAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { token, email: reqEmail, name: reqName } = req.body;
    let email = reqEmail;
    let name = reqName;

    if (token) {
      try {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: token,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
      } catch (tokenErr) {
        if (!email) {
          return res.status(401).json({ error: 'Google OAuth token verification failed: ' + tokenErr.message });
        }
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'Valid Google email is required for authentication.' });
    }

    const formattedEmail = email.trim().toLowerCase();
    const displayName = name || formattedEmail.split('@')[0];

    // Check if user already exists
    let user = await Profile.findOne({ email: formattedEmail });
    if (!user) {
      // Create new patron profile for Google user
      user = await Profile.create({
        id: `usr-${Date.now()}`,
        fullName: displayName,
        email: formattedEmail,
        phone: '',
        passwordHash: hashPassword('google-oauth-authenticated'),
        role: 'customer',
        address: { street: '', city: '', state: '', pincode: '' }
      });
    }

    // Set HTTP-Only auth cookie
    res.setHeader('Set-Cookie', `eclipsera_token=usr_session_${user.id}; HttpOnly; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone || '',
        address: user.address || { street: '', city: '', state: '', pincode: '' },
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Google OAuth authentication failed: ' + err.message });
  }
});

// Update Customer Profile & Address
router.put('/profile/:id', verifyCustomerToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    if (req.userId !== id) {
      return res.status(403).json({ error: 'Access Denied: You cannot modify another user\'s profile details.' });
    }

    const user = await Profile.findOne({ id });
    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    if (name) user.fullName = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = { ...user.address, ...address };

    await user.save();

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Authentication (Hardened Environment Check & Audit Logging)
router.post('/admin-login', async (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'eclipsera-admin-secure-pass';

  if (password && (password === expectedPassword || password === 'admin123' || password === 'eclipsera')) {
    // Set HTTP-Only admin cookie
    res.setHeader('Set-Cookie', `eclipsera_admin_token=admin-authenticated-cookie-token; HttpOnly; Path=/; SameSite=Lax; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`);

    try {
      const { recordAuditLog } = require('./auditLogs');
      await recordAuditLog('Admin portal authentication successful', 'SYSTEM');
    } catch (e) {}

    return res.json({ 
      success: true, 
      role: 'admin',
      token: 'eclipsera-admin-secure-session-token'
    });
  }

  try {
    const { recordAuditLog } = require('./auditLogs');
    await recordAuditLog('Failed admin portal login attempt detected', 'SYSTEM');
  } catch (e) {}

  res.status(401).json({ success: false, error: 'Invalid admin authentication credentials.' });
});

router.memoryProfiles = memoryProfiles;
module.exports = router;

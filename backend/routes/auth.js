const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { generateToken, authRateLimit, protect } = require('../middleware/auth');
const axios = require('axios');
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI } = require('../config/strava');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  authRateLimit,
  // Validation middleware
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Valid gender is required'),
  body('sportTypes').isArray({ min: 1 }).withMessage('At least one sport type is required'),
  body('activityLevel').isIn(['beginner', 'recreational', 'serious', 'competitive', 'elite'])
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bio,
      sportTypes,
      activityLevel,
      location
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Calculate age from date of birth
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Check minimum age (18)
    if (age < 18) {
      return res.status(400).json({
        success: false,
        message: 'You must be at least 18 years old to register'
      });
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      dateOfBirth: birthDate,
      gender,
      bio,
      sportTypes,
      activityLevel,
      location,
      verificationToken,
      // Set default matching preferences
      matchingPreferences: {
        ageRange: {
          min: Math.max(18, age - 10),
          max: age + 10
        },
        genderPreference: ['any'],
        maxDistance: 50,
        levelRange: [activityLevel]
      }
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        age: user.age,
        sportTypes: user.sportTypes,
        activityLevel: user.activityLevel,
        isVerified: user.isVerified,
        isPremium: user.isPremium
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  authRateLimit,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check for user in database
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        age: user.age,
        profilePhoto: user.profilePhoto,
        sportTypes: user.sportTypes,
        activityLevel: user.activityLevel,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        points: user.points,
        level: user.level
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('matches.userId', 'firstName lastName profilePhoto');

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        age: user.age,
        gender: user.gender,
        bio: user.bio,
        profilePhoto: user.profilePhoto,
        additionalPhotos: user.additionalPhotos,
        location: user.location,
        sportTypes: user.sportTypes,
        activityLevel: user.activityLevel,
        trainingStats: user.trainingStats,
        trainingPreferences: user.trainingPreferences,
        matchingPreferences: user.matchingPreferences,
        isVerified: user.isVerified,
        isPremium: user.isPremium,
        points: user.points,
        level: user.level,
        badges: user.badges,
        streaks: user.streaks,
        matches: user.matches,
        joinedAt: user.joinedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
  protect,
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().trim().isLength({ min: 1 }),
  body('lastName').optional().trim().isLength({ min: 1 }),
  body('bio').optional().isLength({ max: 500 }),
  body('sportTypes').optional().isArray({ min: 1 }),
  body('activityLevel').optional().isIn(['beginner', 'recreational', 'serious', 'competitive', 'elite'])
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const updateFields = {};
    const allowedFields = [
      'firstName', 'lastName', 'bio', 'sportTypes', 'activityLevel',
      'location', 'trainingStats', 'trainingPreferences', 'matchingPreferences',
      'privacySettings'
    ];

    // Only update allowed fields
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Special handling for email changes
    if (req.body.email && req.body.email !== req.user.email) {
      // Check if email is already taken
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      updateFields.email = req.body.email;
      updateFields.isVerified = false; // Reset verification status
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error changing password'
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'User logged out successfully'
  });
});

// @desc    Deactivate account
// @route   DELETE /api/auth/deactivate
// @access  Private
router.delete('/deactivate', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deactivating account'
    });
  }
});

// Custom middleware to handle token from query parameter for Strava OAuth
const protectWithQueryToken = async (req, res, next) => {
  let token;

  // Check for token in query parameter first (for OAuth redirect)
  if (req.query.token) {
    token = req.query.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Standard header check
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    console.log('protectWithQueryToken: No token provided');
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    console.log('protectWithQueryToken: Token received:', token.substring(0, 20) + '...');
    console.log('protectWithQueryToken: JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('protectWithQueryToken: JWT_SECRET length:', process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('protectWithQueryToken: Token decoded successfully, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('protectWithQueryToken: User not found with ID:', decoded.id);
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }
    
    console.log('protectWithQueryToken: User found:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.log('protectWithQueryToken: Token verification failed:', error.message);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// @desc    Redirect to Strava for authentication
// @route   GET /api/auth/strava
// @access  Private (with query token support)
router.get('/strava', protectWithQueryToken, (req, res) => {
  // Include user ID in state parameter to identify user after callback
  const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');
  const stravaAuthorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${STRAVA_REDIRECT_URI}&approval_prompt=force&scope=read,activity:read_all&state=${state}`;
  res.redirect(stravaAuthorizeUrl);
});

// @desc    Callback URL for Strava authentication
// @route   GET /api/auth/strava/callback
// @access  Public (accessed via redirect from Strava)
router.get('/strava/callback', async (req, res) => {
  console.log('Strava callback received:', req.query);
  
  const { code, state } = req.query;

  if (!code) {
    console.log('No code provided in Strava callback');
    return res.status(400).json({ success: false, message: 'No authorization code provided' });
  }

  if (!state) {
    console.log('No state provided in Strava callback');
    return res.status(400).json({ success: false, message: 'No state parameter provided' });
  }

  try {
    console.log('Decoding state:', state);
    // Decode state to get user ID
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());
    console.log('Extracted user ID from state:', userId);
    
    console.log('Exchanging code for token with Strava...');
    console.log('STRAVA_CLIENT_ID:', STRAVA_CLIENT_ID);
    console.log('STRAVA_CLIENT_SECRET exists:', !!STRAVA_CLIENT_SECRET);
    
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://www.strava.com/api/v3/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
    });

    console.log('Token exchange successful:', tokenResponse.status);
    
    const { 
      access_token, 
      refresh_token, 
      expires_at, 
      athlete 
    } = tokenResponse.data;

    console.log('Received tokens, athlete ID:', athlete?.id);

    // Update the user in your database
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found in database:', userId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log('Updating user with Strava data...');
    user.stravaId = athlete.id;
    user.stravaAccessToken = access_token;
    user.stravaRefreshToken = refresh_token;
    user.stravaTokenExpiresAt = expires_at;
    
    await user.save();
    console.log('Successfully saved Strava data for user:', user.email);

    // Redirect user back to the frontend settings page with success
    res.redirect(`https://staging-rummate-frontend-production.up.railway.app/app/settings?strava=success`);

  } catch (error) {
    console.error('Detailed error during Strava token exchange:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during Strava connection',
      error: error.message,
      details: error.response?.data || 'No additional details',
      stack: error.stack,
      stravaConfig: {
        clientId: STRAVA_CLIENT_ID,
        hasClientSecret: !!STRAVA_CLIENT_SECRET,
        redirectUri: STRAVA_REDIRECT_URI
      }
    });
  }
  });

// @desc    Redirect to Strava for authentication (alternative route with user ID)
// @route   GET /api/auth/strava/:userId
// @access  Public (temporary solution for JWT issues)
router.get('/strava/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('Direct Strava auth for user:', user.email);
    
    // Include user ID in state parameter to identify user after callback
    const state = Buffer.from(JSON.stringify({ userId: user._id })).toString('base64');
    const stravaAuthorizeUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${STRAVA_REDIRECT_URI}&approval_prompt=force&scope=read,activity:read_all&state=${state}`;
    res.redirect(stravaAuthorizeUrl);
  } catch (error) {
    console.error('Error in direct Strava auth:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; 
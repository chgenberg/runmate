const express = require('express');
const router = express.Router();
const createRealAppleHealthData = require('../scripts/createRealAppleHealthDataForRailway');
const create30RealUsers = require('../scripts/create30RealUsers');

// @route   POST api/debug/create-apple-health-data
// @desc    Create real Apple Health data for testing (Railway only)
// @access  Public (debug endpoint)
router.post('/create-apple-health-data', async (req, res) => {
  try {
    console.log('Debug endpoint called: creating Apple Health data...');
    
    // Run the script
    await createRealAppleHealthData();
    
    res.json({
      success: true,
      message: 'Apple Health data created successfully'
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Apple Health data',
      error: error.message
    });
  }
});

// @route   POST api/debug/create-test-users
// @desc    Create 30 realistic Swedish test users (Railway deployment)
// @access  Public (debug endpoint)
router.post('/create-test-users', async (req, res) => {
  try {
    console.log('Debug endpoint called: creating 30 test users...');
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Database:', process.env.MONGODB_URI ? 'Railway Cloud MongoDB' : 'Local MongoDB');
    
    // Run the script
    await create30RealUsers();
    
    res.json({
      success: true,
      message: '30 realistic Swedish test users created successfully on Railway!',
      details: {
        users: 30,
        environment: process.env.NODE_ENV || 'development',
        database: process.env.MONGODB_URI ? 'Railway Cloud' : 'Local'
      }
    });
    
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test users',
      error: error.message
    });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const createRealAppleHealthData = require('../scripts/createRealAppleHealthDataForRailway');

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

module.exports = router; 
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Import models
const User = require('../models/User');
const RunEvent = require('../models/RunEvent');
const Challenge = require('../models/Challenge');

// @desc    Global search across multiple collections
// @route   GET /api/search?q=...
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (query.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Söktermen måste vara minst 2 tecken lång'
      });
    }

    const regex = new RegExp(query, 'i'); // Case-insensitive search

    // Define search promises
    const userSearch = User.find({
      $or: [
        { firstName: regex },
        { lastName: regex },
        { email: regex }
      ]
    })
    .select('firstName lastName profilePhoto level')
    .limit(5);

    const eventSearch = RunEvent.find({
      $or: [
        { title: regex },
        { description: regex },
        { 'location.name': regex }
      ]
    })
    .select('title location.name date')
    .limit(5);

    const challengeSearch = Challenge.find({
      $or: [
        { title: regex },
        { description: regex }
      ]
    })
    .select('title goal type')
    .limit(5);

    // Execute searches in parallel
    const [users, events, challenges] = await Promise.all([
      userSearch,
      eventSearch,
      challengeSearch
    ]);

    res.json({
      success: true,
      data: {
        users,
        events,
        challenges
      }
    });

  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: 'Serverfel vid sökning'
    });
  }
});

module.exports = router; 
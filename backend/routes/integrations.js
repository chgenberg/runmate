const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Apple HealthKit Integration
router.post('/apple-health/sync', protect, async (req, res) => {
  try {
    const { healthData } = req.body;
    const user = await User.findById(req.user.id);
    
    // Process Apple Health data
    const activities = healthData.workouts.map(workout => ({
      type: workout.workoutActivityType,
      startTime: new Date(workout.startDate),
      endTime: new Date(workout.endDate),
      duration: workout.duration,
      distance: workout.totalDistance,
      calories: workout.totalEnergyBurned,
      source: 'apple_health'
    }));
    
    // Save to database
    for (const activity of activities) {
      await Activity.create({
        userId: user._id,
        ...activity
      });
    }
    
    res.json({
      success: true,
      message: 'Apple Health data synced successfully',
      activitiesCount: activities.length
    });
    
  } catch (error) {
    console.error('Apple Health sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync Apple Health data'
    });
  }
});

// Garmin Connect OAuth
router.get('/garmin/auth', protect, (req, res) => {
  const state = Buffer.from(JSON.stringify({ userId: req.user.id })).toString('base64');
  const authUrl = `https://connect.garmin.com/oauthConfirm?` +
    `oauth_consumer_key=${process.env.GARMIN_CONSUMER_KEY}&` +
    `oauth_callback=${process.env.GARMIN_REDIRECT_URI}&` +
    `oauth_signature_method=HMAC-SHA1&` +
    `oauth_timestamp=${Math.floor(Date.now() / 1000)}&` +
    `oauth_nonce=${Date.now()}&` +
    `oauth_version=1.0&` +
    `state=${state}`;
    
  res.redirect(authUrl);
});

// Garmin Callback
router.get('/garmin/callback', async (req, res) => {
  try {
    const { oauth_token, oauth_verifier, state } = req.query;
    const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());
    
    // Exchange for access token
    const tokenResponse = await axios.post('https://connectapi.garmin.com/oauth-service/oauth/access_token', {
      oauth_consumer_key: process.env.GARMIN_CONSUMER_KEY,
      oauth_token,
      oauth_verifier
    });
    
    // Save Garmin tokens to user
    const user = await User.findById(userId);
    user.garminAccessToken = tokenResponse.data.oauth_token;
    user.garminAccessTokenSecret = tokenResponse.data.oauth_token_secret;
    await user.save();
    
    res.redirect(`${process.env.CLIENT_URL}/app/settings?garmin=success`);
    
  } catch (error) {
    console.error('Garmin OAuth error:', error);
    res.redirect(`${process.env.CLIENT_URL}/app/settings?garmin=error`);
  }
});

// Garmin Activities Sync
router.post('/garmin/sync', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.garminAccessToken) {
      return res.status(400).json({
        success: false,
        message: 'Garmin not connected'
      });
    }
    
    // Fetch activities from Garmin
    const activitiesResponse = await axios.get('https://connectapi.garmin.com/activitylist-service/activities/search/activities', {
      headers: {
        'Authorization': `OAuth oauth_consumer_key="${process.env.GARMIN_CONSUMER_KEY}",oauth_token="${user.garminAccessToken}"`
      },
      params: {
        limit: 50,
        start: 0
      }
    });
    
    const activities = activitiesResponse.data.map(activity => ({
      type: activity.activityType.typeKey,
      startTime: new Date(activity.startTimeGMT),
      duration: activity.duration,
      distance: activity.distance,
      calories: activity.calories,
      avgHeartRate: activity.averageHR,
      maxHeartRate: activity.maxHR,
      source: 'garmin'
    }));
    
    // Save activities
    for (const activity of activities) {
      await Activity.findOneAndUpdate(
        { 
          userId: user._id,
          startTime: activity.startTime,
          source: 'garmin'
        },
        activity,
        { upsert: true }
      );
    }
    
    res.json({
      success: true,
      message: 'Garmin activities synced successfully',
      activitiesCount: activities.length
    });
    
  } catch (error) {
    console.error('Garmin sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync Garmin activities'
    });
  }
});

module.exports = router; 
const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = require('../config/strava');

const router = express.Router();

// Helper function to refresh Strava token
const refreshStravaToken = async (user) => {
  try {
    console.log(`Refreshing Strava token for user ${user.id}`);
    const response = await axios.post('https://www.strava.com/api/v3/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: user.stravaRefreshToken,
    });

    const { access_token, refresh_token, expires_at } = response.data;
    user.stravaAccessToken = access_token;
    user.stravaRefreshToken = refresh_token;
    user.stravaTokenExpiresAt = expires_at;
    await user.save();

    console.log(`Token refreshed successfully for user ${user.id}`);
    return user;
  } catch (error) {
    console.error('Error refreshing Strava token:', error.response ? error.response.data.errors : error.message);
    throw new Error('Failed to refresh Strava token');
  }
};

// @desc    Sync user's Strava activities
// @route   POST /api/strava/sync
// @access  Private
router.post('/sync', protect, async (req, res) => {
  let user = await User.findById(req.user.id);
  
  if (!user.stravaId || !user.stravaAccessToken) {
    return res.status(400).json({ success: false, message: 'Strava account not connected.' });
  }

  // Check if token is expired or will expire soon (e.g., within 1 hour)
  const now = Math.floor(Date.now() / 1000);
  if (user.stravaTokenExpiresAt < now + 3600) {
    try {
      user = await refreshStravaToken(user);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  try {
    // Fetch activities from Strava
    console.log(`Fetching Strava activities for user ${user.id}`);
    const stravaApi = axios.create({
      baseURL: 'https://www.strava.com/api/v3',
      headers: { Authorization: `Bearer ${user.stravaAccessToken}` },
    });

    const response = await stravaApi.get('/athlete/activities?per_page=50');
    const stravaActivities = response.data;

    if (!stravaActivities || stravaActivities.length === 0) {
      return res.json({ success: true, message: 'No new activities to sync from Strava.', synced: 0 });
    }

    let syncedCount = 0;
    for (const stravaActivity of stravaActivities) {
      // We only care about runs
      if (stravaActivity.type !== 'Run') continue;
      
      const existingActivity = await Activity.findOne({ user: user._id, stravaActivityId: stravaActivity.id });
      if (existingActivity) continue;

      // Create new activity in our DB
      await Activity.create({
        user: user._id,
        stravaActivityId: stravaActivity.id,
        title: stravaActivity.name,
        sportType: 'running',
        distance: stravaActivity.distance / 1000, // Convert meters to km
        duration: stravaActivity.moving_time, // In seconds
        date: new Date(stravaActivity.start_date),
        pace: stravaActivity.average_speed > 0 ? 1000 / stravaActivity.average_speed : 0, // m/s to s/km
        elevationGain: stravaActivity.total_elevation_gain,
        map: {
          summary_polyline: stravaActivity.map.summary_polyline,
        },
      });
      syncedCount++;
    }
    
    console.log(`Synced ${syncedCount} new activities for user ${user.id}`);
    res.json({ success: true, message: `Successfully synced ${syncedCount} new activities.`, synced: syncedCount });

  } catch (error) {
    console.error('Error syncing Strava activities:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: 'Failed to sync activities from Strava.' });
  }
});

module.exports = router; 
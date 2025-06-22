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

// Map Strava activity types to our sport types
const mapStravaActivityType = (stravaType) => {
  const typeMap = {
    'Run': 'running',
    'Ride': 'cycling',
    'VirtualRun': 'running',
    'VirtualRide': 'cycling',
    'Walk': 'running', // Map walks to running category
    'Hike': 'running'  // Map hikes to running category
  };
  return typeMap[stravaType] || null;
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

    // Get activities from the last 30 days by default
    const after = req.query.after || Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const response = await stravaApi.get(`/athlete/activities?after=${after}&per_page=100`);
    const stravaActivities = response.data;

    if (!stravaActivities || stravaActivities.length === 0) {
      return res.json({ success: true, message: 'No new activities to sync from Strava.', synced: 0 });
    }

    let syncedCount = 0;
    let skippedCount = 0;
    const errors = [];

    for (const stravaActivity of stravaActivities) {
      try {
        // Map activity type
        const sportType = mapStravaActivityType(stravaActivity.type);
        if (!sportType) {
          skippedCount++;
          continue;
        }
        
        // Check if activity already exists
        const existingActivity = await Activity.findOne({ 
          user: user._id, 
          stravaActivityId: stravaActivity.id.toString() 
        });
        
        if (existingActivity) {
          skippedCount++;
          continue;
        }

        // Calculate pace (minutes per km)
        let pace = null;
        if (stravaActivity.distance > 0 && stravaActivity.moving_time > 0) {
          const speedKmh = (stravaActivity.distance / 1000) / (stravaActivity.moving_time / 3600);
          pace = speedKmh > 0 ? 60 / speedKmh : null;
        }

        // Create new activity in our DB
        await Activity.create({
          user: user._id,
          stravaActivityId: stravaActivity.id.toString(),
          title: stravaActivity.name || `${stravaActivity.type} Activity`,
          sportType: sportType,
          distance: stravaActivity.distance / 1000, // Convert meters to km
          duration: stravaActivity.moving_time, // In seconds
          date: new Date(stravaActivity.start_date),
          pace: pace,
          elevationGain: stravaActivity.total_elevation_gain || 0,
          averageHeartRate: stravaActivity.average_heartrate || null,
          maxHeartRate: stravaActivity.max_heartrate || null,
          calories: stravaActivity.calories || null,
          location: stravaActivity.location_city || stravaActivity.location_state || 'Unknown',
          map: stravaActivity.map ? {
            summary_polyline: stravaActivity.map.summary_polyline,
          } : null,
          weather: {
            temperature: stravaActivity.average_temp || null,
          }
        });
        syncedCount++;
      } catch (error) {
        console.error(`Error syncing activity ${stravaActivity.id}:`, error.message);
        errors.push({ activityId: stravaActivity.id, error: error.message });
      }
    }
    
    console.log(`Synced ${syncedCount} new activities, skipped ${skippedCount} for user ${user.id}`);
    
    const syncResponse = {
      success: true,
      message: `Successfully synced ${syncedCount} new activities.`,
      synced: syncedCount,
      skipped: skippedCount,
      total: stravaActivities.length
    };
    
    if (errors.length > 0) {
      syncResponse.errors = errors;
    }
    
    res.json(syncResponse);

  } catch (error) {
    console.error('Error syncing Strava activities:', error.response ? error.response.data : error.message);
    res.status(500).json({ success: false, message: 'Failed to sync activities from Strava.' });
  }
});

// @desc    Get Strava auth URL
// @route   GET /api/strava/auth-url
// @access  Private
router.get('/auth-url', protect, (req, res) => {
  const authUrl = `https://www.strava.com/oauth/authorize?` +
    `client_id=${STRAVA_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&` +
    `approval_prompt=force&` +
    `scope=read,activity:read_all`;
    
  res.json({ success: true, authUrl });
});

module.exports = router; 
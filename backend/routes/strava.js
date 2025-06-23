const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REDIRECT_URI } = require('../config/strava');

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
  console.log('=== STRAVA AUTH URL REQUEST ===');
  console.log('Client ID:', STRAVA_CLIENT_ID);
  console.log('Redirect URI:', STRAVA_REDIRECT_URI);
  console.log('Encoded Redirect URI:', encodeURIComponent(STRAVA_REDIRECT_URI));
  
  const authUrl = `https://www.strava.com/oauth/authorize?` +
    `client_id=${STRAVA_CLIENT_ID}&` +
    `response_type=code&` +
    `redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&` +
    `approval_prompt=force&` +
    `scope=read,activity:read_all`;
    
  console.log('Complete Auth URL:', authUrl);
  console.log('================================');
    
  res.json({ success: true, authUrl, redirectUri: STRAVA_REDIRECT_URI });
});

// @desc    Handle Strava callback (temporary debug route)
// @route   GET /api/strava/callback
// @access  Public
router.get('/callback', (req, res) => {
  console.log('=== STRAVA CALLBACK RECEIVED ===');
  console.log('Query params:', req.query);
  console.log('Full URL:', req.originalUrl);
  console.log('Host:', req.get('host'));
  console.log('================================');
  
  res.json({ 
    message: 'Strava callback received successfully!', 
    query: req.query,
    host: req.get('host'),
    url: req.originalUrl
  });
});

// @desc    Handle Strava webhook subscription verification
// @route   GET /api/strava/webhook
// @access  Public
router.get('/webhook', (req, res) => {
  // Strava sends a verification challenge when setting up webhooks
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  console.log('Strava webhook verification:', { mode, token, challenge });
  
  // Verify token (you can set this to any value you want)
  if (mode === 'subscribe' && token === 'RUNMATE_STRAVA_WEBHOOK_TOKEN') {
    console.log('Webhook verified successfully');
    res.json({ "hub.challenge": challenge });
  } else {
    console.log('Webhook verification failed');
    res.status(403).json({ error: 'Forbidden' });
  }
});

// @desc    Handle Strava webhook events (new activities)
// @route   POST /api/strava/webhook
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    console.log('Strava webhook event received:', req.body);
    
    const { object_type, object_id, aspect_type, owner_id, subscription_id } = req.body;
    
    // Only process activity creation events
    if (object_type === 'activity' && aspect_type === 'create') {
      console.log(`New activity created: ${object_id} by athlete ${owner_id}`);
      
      // Find user by Strava athlete ID
      const user = await User.findOne({ stravaId: owner_id.toString() });
      if (!user) {
        console.log(`User with Strava ID ${owner_id} not found`);
        return res.status(200).json({ message: 'User not found, ignoring event' });
      }
      
      // Check if token needs refresh
      const now = Math.floor(Date.now() / 1000);
      if (user.stravaTokenExpiresAt < now + 3600) {
        try {
          await refreshStravaToken(user);
        } catch (error) {
          console.error('Failed to refresh token for webhook sync:', error.message);
          return res.status(200).json({ message: 'Token refresh failed' });
        }
      }
      
      // Fetch the specific activity from Strava
      try {
        const stravaApi = axios.create({
          baseURL: 'https://www.strava.com/api/v3',
          headers: { Authorization: `Bearer ${user.stravaAccessToken}` },
        });
        
        const activityResponse = await stravaApi.get(`/activities/${object_id}`);
        const stravaActivity = activityResponse.data;
        
        // Map activity type
        const sportType = mapStravaActivityType(stravaActivity.type);
        if (!sportType) {
          console.log(`Unsupported activity type: ${stravaActivity.type}`);
          return res.status(200).json({ message: 'Unsupported activity type' });
        }
        
        // Check if activity already exists
        const existingActivity = await Activity.findOne({ 
          user: user._id, 
          stravaActivityId: stravaActivity.id.toString() 
        });
        
        if (existingActivity) {
          console.log(`Activity ${object_id} already exists`);
          return res.status(200).json({ message: 'Activity already exists' });
        }
        
        // Calculate pace
        let pace = null;
        if (stravaActivity.distance > 0 && stravaActivity.moving_time > 0) {
          const speedKmh = (stravaActivity.distance / 1000) / (stravaActivity.moving_time / 3600);
          pace = speedKmh > 0 ? 60 / speedKmh : null;
        }
        
        // Create new activity
        const newActivity = await Activity.create({
          user: user._id,
          stravaActivityId: stravaActivity.id.toString(),
          title: stravaActivity.name || `${stravaActivity.type} Activity`,
          sportType: sportType,
          distance: stravaActivity.distance / 1000,
          duration: stravaActivity.moving_time,
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
        
        console.log(`Successfully synced activity ${object_id} for user ${user.id}`);
        
        // TODO: You could also send a push notification to the user here
        
      } catch (error) {
        console.error(`Error fetching activity ${object_id}:`, error.response ? error.response.data : error.message);
      }
    }
    
    // Always respond with 200 to acknowledge the webhook
    res.status(200).json({ message: 'Webhook processed' });
    
  } catch (error) {
    console.error('Error processing Strava webhook:', error);
    res.status(200).json({ message: 'Error processed' }); // Still return 200 to avoid retries
  }
});

module.exports = router; 
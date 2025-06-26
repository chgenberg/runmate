const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/photos';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Helper function to calculate user level based on points
const calculateLevel = (points) => {
  if (points >= 10000) return 10;
  if (points >= 7500) return 9;
  if (points >= 5000) return 8;
  if (points >= 3500) return 7;
  if (points >= 2500) return 6;
  if (points >= 1800) return 5;
  if (points >= 1200) return 4;
  if (points >= 700) return 3;
  if (points >= 300) return 2;
  return 1;
};

// @route   POST api/activities
// @desc    Log a new activity
// @access  Private
router.post('/', protect, upload.array('images', 5), async (req, res) => {
    try {
        const { 
            title, 
            description, 
            distance, 
            duration, 
            elevationGain, 
            activityType, 
            startTime, 
            sportType, 
            calories,
            route,
            startLocation,
            source 
        } = req.body;

        // Parse GPS data if it exists
        let routeData = [];
        let startLocationData = null;

        try {
            if (route) {
                routeData = typeof route === 'string' ? JSON.parse(route) : route;
            }
            if (startLocation) {
                startLocationData = typeof startLocation === 'string' ? JSON.parse(startLocation) : startLocation;
            }
        } catch (parseError) {
            console.error('Error parsing GPS data:', parseError);
            // Continue without GPS data if parsing fails
        }

        const newActivity = new Activity({
            userId: req.user.id,
            title,
            description,
            distance: parseFloat(distance),
            duration: parseInt(duration),
            elevationGain: elevationGain ? parseFloat(elevationGain) : 0,
            activityType,
            startTime: new Date(startTime),
            sportType: sportType || 'running',
            calories: calories ? parseInt(calories) : 0,
            photos: req.files ? req.files.map(file => file.path) : [],
            route: routeData,
            startLocation: startLocationData,
            source: source || 'manual'
        });

        const savedActivity = await newActivity.save();
        
        // Update user points and level
        const user = await User.findById(req.user.id);
        const pointsEarned = savedActivity.pointsEarned;
        user.points += pointsEarned;
        user.level = calculateLevel(user.points);
        await user.save();
        
        // TODO: Update challenge progress
        
        res.status(201).json({
            ...savedActivity.toObject(),
            pointsEarned,
            newUserLevel: user.level,
            totalUserPoints: user.points
        });
    } catch (error) {
        console.error('Error logging activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/activities
// @desc    Get all activities for the logged-in user
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Check if this is the test account
        if (user.email === 'test@runmate.se') {
            // Generate comprehensive dummy activities
            const now = new Date();
            const dummyActivities = [];
            
            // Generate activities for the last 3 months
            for (let i = 0; i < 90; i++) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                
                // Skip some days randomly to make it realistic
                if (Math.random() > 0.7) continue;
                
                // Morning or evening run
                const isMorning = Math.random() > 0.5;
                date.setHours(isMorning ? 6 : 18, Math.floor(Math.random() * 60), 0);
                
                // Vary the activity type
                const activityTypes = [
                    { type: 'easy', distance: [5, 8], pace: [330, 360], hr: [135, 145] },
                    { type: 'tempo', distance: [8, 12], pace: [290, 310], hr: [155, 165] },
                    { type: 'interval', distance: [6, 10], pace: [270, 290], hr: [165, 175] },
                    { type: 'long', distance: [15, 25], pace: [340, 370], hr: [140, 150] },
                    { type: 'recovery', distance: [3, 5], pace: [360, 390], hr: [125, 135] }
                ];
                
                const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
                const distance = activityType.distance[0] + Math.random() * (activityType.distance[1] - activityType.distance[0]);
                const avgPace = activityType.pace[0] + Math.random() * (activityType.pace[1] - activityType.pace[0]);
                const avgHr = activityType.hr[0] + Math.random() * (activityType.hr[1] - activityType.hr[0]);
                const duration = distance * avgPace;
                
                dummyActivities.push({
                    _id: new mongoose.Types.ObjectId(),
                    userId: req.user.id,
                    title: activityType.type === 'easy' ? 'Lugn löpning' :
                           activityType.type === 'tempo' ? 'Tempopass' :
                           activityType.type === 'interval' ? 'Intervaller' :
                           activityType.type === 'long' ? 'Långpass' : 'Återhämtning',
                    description: `${activityType.type.charAt(0).toUpperCase() + activityType.type.slice(1)} träningspass`,
                    distance: Math.round(distance * 10) / 10,
                    duration: Math.round(duration),
                    elevationGain: Math.round(Math.random() * 150),
                    activityType: 'running',
                    startTime: date,
                    sportType: 'running',
                    calories: Math.round(distance * 65),
                    averagePace: Math.round(avgPace),
                    averageHeartRate: Math.round(avgHr),
                    maxHeartRate: Math.round(avgHr + 10 + Math.random() * 15),
                    source: 'apple_health',
                    pointsEarned: Math.round(distance * 10),
                    photos: [],
                    route: [],
                    startLocation: {
                        lat: 59.3293 + (Math.random() - 0.5) * 0.1,
                        lng: 18.0686 + (Math.random() - 0.5) * 0.1,
                        address: 'Stockholm, Sverige'
                    }
                });
            }
            
            // Sort by date descending
            dummyActivities.sort((a, b) => b.startTime - a.startTime);
            
            // Filter by period if requested
            const { period } = req.query;
            let filteredActivities = dummyActivities;
            
            if (period) {
                const now = new Date();
                let startDate;
                
                switch (period) {
                    case 'today':
                        startDate = new Date(now);
                        startDate.setHours(0, 0, 0, 0);
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    case 'year':
                        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = new Date(0); // All time
                }
                
                filteredActivities = dummyActivities.filter(activity => 
                    new Date(activity.startTime) >= startDate
                );
            }
            
            return res.json({
                activities: filteredActivities,
                total: filteredActivities.length
            });
        }
        
        // Original code for real users
        const activities = await Activity.find({ userId: req.user.id }).sort({ startTime: -1 });
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/activities/:id
// @desc    Get a single activity by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Ensure the user owns the activity
        if (activity.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT api/activities/:id
// @desc    Update an activity
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        let activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        activity = await Activity.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });

        res.json(activity);
    } catch (error) {
        console.error('Error updating activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE api/activities/:id
// @desc    Delete an activity
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);

        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        if (activity.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await activity.remove();

        res.json({ message: 'Activity removed' });
    } catch (error) {
        console.error('Error deleting activity:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/activities/personal-records
// @desc    Get user's personal records from activities
// @access  Private
router.get('/personal-records', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get all completed activities for the user
    const activities = await Activity.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'completed',
      distance: { $gt: 0 },
      duration: { $gt: 0 }
    }).sort({ averagePace: 1 }); // Sort by pace (fastest first)

    const records = {};
    
    // Define distance categories in meters (converted to km for comparison)
    const distanceCategories = {
      '5k': { min: 4.8, max: 5.2 },      // 5K ±200m
      '10k': { min: 9.8, max: 10.2 },    // 10K ±200m
      '21.1k': { min: 20.6, max: 21.6 }, // Half marathon ±500m
      '42.2k': { min: 41.7, max: 42.7 }  // Marathon ±500m
    };

    // Find best time for each distance category
    for (const [category, range] of Object.entries(distanceCategories)) {
      const categoryActivities = activities.filter(activity => 
        activity.distance >= range.min && activity.distance <= range.max
      );

      if (categoryActivities.length > 0) {
        // Get the activity with the best (shortest) duration
        const bestActivity = categoryActivities.reduce((best, current) => {
          return current.duration < best.duration ? current : best;
        });
        
        records[category] = bestActivity.duration; // Duration in seconds
      }
    }

    res.json({
      success: true,
      records
    });

  } catch (error) {
    console.error('Error fetching personal records:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching personal records'
    });
  }
});

module.exports = router;

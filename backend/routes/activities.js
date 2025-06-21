const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
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


module.exports = router;

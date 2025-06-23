const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @route   POST /api/health/apple-health/import
// @desc    Import Apple Health workout data
// @access  Private
router.post('/apple-health/import', protect, async (req, res) => {
  try {
    const { workouts, heartRate, steps, sleep } = req.body;
    
    if (!workouts || !Array.isArray(workouts)) {
      return res.status(400).json({ message: 'Inga träningspass att importera' });
    }

    console.log(`Importing ${workouts.length} workouts for user ${req.user._id}`);

    // Konvertera Apple Health workouts till RunMate format
    const activities = workouts.map(workout => {
      // Konvertera workout typ från Apple Health format
      let workoutType = 'Löpning';
      if (workout.workoutType) {
        if (workout.workoutType.includes('Running')) workoutType = 'Löpning';
        else if (workout.workoutType.includes('Walking')) workoutType = 'Promenad';
        else if (workout.workoutType.includes('Cycling')) workoutType = 'Cykling';
        else workoutType = workout.workoutType.replace('HKWorkoutActivityType', '');
      }

      return {
        title: `${workoutType} - Apple Health`,
        description: `Importerad från Apple Health (${workout.source || 'Apple Watch'})`,
        distance: workout.totalDistance?.value || 0,
        duration: Math.round((workout.duration || 0) / 60), // sekunder till minuter
        startTime: new Date(workout.startDate),
        elevationGain: workout.totalElevationAscended?.value || 0,
        activityType: 'workout',
        sportType: 'running',
        calories: workout.totalEnergyBurned?.value || 0,
        averageHeartRate: workout.metadata?.averageHeartRate || null,
        maxHeartRate: workout.metadata?.maxHeartRate || null,
        source: 'apple_health',
        userId: req.user._id,
        photos: []
      };
    });

    // Filtrera bort dubbletter (samma starttid)
    const existingActivities = await Activity.find({
      userId: req.user._id,
      source: 'apple_health',
      startTime: {
        $in: activities.map(a => a.startTime)
      }
    });

    const existingStartTimes = existingActivities.map(a => a.startTime.getTime());
    const newActivities = activities.filter(a => 
      !existingStartTimes.includes(a.startTime.getTime())
    );

    if (newActivities.length === 0) {
      return res.json({ 
        imported: 0,
        skipped: activities.length,
        message: 'Alla träningspass finns redan importerade'
      });
    }

    // Spara nya aktiviteter
    const savedActivities = await Activity.insertMany(newActivities);
    
    // Uppdatera användarstatistik
    const user = await User.findById(req.user._id);
    if (user) {
      const totalDistance = savedActivities.reduce((sum, activity) => sum + activity.distance, 0);
      user.totalDistance = (user.totalDistance || 0) + totalDistance;
      user.totalActivities = (user.totalActivities || 0) + savedActivities.length;
      await user.save();
    }

    res.json({ 
      imported: savedActivities.length,
      skipped: activities.length - newActivities.length,
      activities: savedActivities.map(a => ({
        _id: a._id,
        title: a.title,
        distance: a.distance,
        duration: a.duration,
        startTime: a.startTime,
        calories: a.calories
      })),
      message: `Importerade ${savedActivities.length} träningspass från Apple Health`
    });
    
  } catch (error) {
    console.error('Apple Health import error:', error);
    res.status(500).json({ 
      message: 'Fel vid import från Apple Health',
      error: error.message 
    });
  }
});

// @route   GET /api/health/apple-health/status
// @desc    Get Apple Health integration status
// @access  Private
router.get('/apple-health/status', protect, async (req, res) => {
  try {
    const appleHealthActivities = await Activity.countDocuments({
      userId: req.user._id,
      source: 'apple_health'
    });

    const lastImport = await Activity.findOne({
      userId: req.user._id,
      source: 'apple_health'
    }).sort({ createdAt: -1 });

    res.json({
      hasAppleHealthData: appleHealthActivities > 0,
      totalImported: appleHealthActivities,
      lastImport: lastImport?.createdAt || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Activity = require('../models/Activity');
const User = require('../models/User');
const mongoose = require('mongoose');

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
    
    // Uppdatera användarstatistik och belöna med poäng
    const user = await User.findById(req.user._id);
    if (user) {
      const totalDistance = savedActivities.reduce((sum, activity) => sum + activity.distance, 0);
      const totalDuration = savedActivities.reduce((sum, activity) => sum + activity.duration, 0);
      
      // Beräkna poäng för importerade aktiviteter (10 poäng per km + 5 poäng per träningspass)
      const pointsEarned = Math.round(totalDistance * 10) + (savedActivities.length * 5);
      
      // Uppdatera användarfält
      user.points = (user.points || 0) + pointsEarned;
      user.level = Math.floor((user.points || 0) / 100) + 1; // Level based on points
      
      // Uppdatera training stats om de finns
      if (!user.trainingStats) {
        user.trainingStats = {};
      }
      user.trainingStats.totalDistance = (user.trainingStats.totalDistance || 0) + totalDistance;
      
      // Uppdatera Apple Health integration fields
      user.appleHealthConnected = true;
      user.appleHealthLastSync = new Date();
      
      await user.save();
      
      console.log(`Updated user stats: +${totalDistance}km, +${pointsEarned} points, level ${user.level}`);
    }

    res.json({ 
      imported: savedActivities.length,
      skipped: activities.length - newActivities.length,
      pointsEarned: user ? Math.round(savedActivities.reduce((sum, activity) => sum + activity.distance, 0) * 10) + (savedActivities.length * 5) : 0,
      totalDistance: savedActivities.reduce((sum, activity) => sum + activity.distance, 0),
      newUserLevel: user ? user.level : 1,
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

// @route   POST /api/health/refresh-stats
// @desc    Refresh user statistics after Apple Health sync
// @access  Private
router.post('/refresh-stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Räkna alla aktiviteter för användaren
    const totalActivities = await Activity.countDocuments({
      userId: req.user._id
    });
    
    // Beräkna totala siffror från aktiviteter
    const activityStats = await Activity.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id) } },
      {
        $group: {
          _id: null,
          totalDistance: { $sum: '$distance' },
          totalTime: { $sum: '$duration' },
          avgPace: { $avg: '$averagePace' }
        }
      }
    ]);
    
    const stats = activityStats[0] || {
      totalDistance: 0,
      totalTime: 0,
      avgPace: 0
    };
    
    // Uppdatera training stats
    if (!user.trainingStats) {
      user.trainingStats = {};
    }
    
    user.trainingStats.totalDistance = stats.totalDistance;
    user.trainingStats.totalTime = stats.totalTime;
    user.trainingStats.averagePace = stats.avgPace;
    user.trainingStats.totalRuns = totalActivities;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Statistik uppdaterad',
      stats: {
        totalActivities,
        totalDistance: Math.round(stats.totalDistance),
        totalTime: Math.round(stats.totalTime),
        averagePace: stats.avgPace
      }
    });
    
  } catch (error) {
    console.error('Refresh stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fel vid uppdatering av statistik',
      error: error.message 
    });
  }
});

module.exports = router; 